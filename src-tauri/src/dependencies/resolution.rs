use crate::cli::template;
use crate::types::{DependencyTree, DependencyNode, CliToolTemplate};
use std::collections::{HashMap, HashSet};

/// Resolve installation order using topological sort
pub fn resolve_installation_order(tool_ids: &[String]) -> Result<Vec<String>, String> {
    let templates = template::list_all_templates();
    resolve_installation_order_with_templates(tool_ids, &templates)
}

/// Resolve installation order with provided templates (for testing)
pub fn resolve_installation_order_with_templates(
    tool_ids: &[String],
    templates: &[CliToolTemplate],
) -> Result<Vec<String>, String> {
    let template_map: HashMap<String, _> = templates
        .into_iter()
        .map(|t| (t.id.clone(), t))
        .collect();

    // Validate all tool IDs exist
    for id in tool_ids {
        if !template_map.contains_key(id) {
            return Err(format!("Unknown tool ID: {}", id));
        }
    }

    // Build adjacency list and in-degree count
    let mut adj: HashMap<String, Vec<String>> = HashMap::new();
    let mut in_degree: HashMap<String, usize> = HashMap::new();

    for id in tool_ids {
        adj.entry(id.clone()).or_default();
        in_degree.entry(id.clone()).or_insert(0);
    }

    for id in tool_ids {
        if let Some(template) = template_map.get(id) {
            if let Some(deps) = &template.dependencies {
                for dep in deps {
                    // Only include dependencies that are in our target set
                    if tool_ids.contains(dep) {
                        adj.entry(dep.clone())
                            .or_default()
                            .push(id.clone());
                        *in_degree.entry(id.clone()).or_insert(0) += 1;
                    }
                }
            }
        }
    }

    // Detect circular dependencies
    let mut visited = HashSet::new();
    let mut rec_stack = HashSet::new();
    for id in tool_ids {
        if has_cycle(&adj, id, &mut visited, &mut rec_stack) {
            return Err("Circular dependency detected".to_string());
        }
    }

    // Topological sort using Kahn's algorithm
    let mut queue: Vec<String> = in_degree
        .iter()
        .filter(|(_, &deg)| deg == 0)
        .map(|(id, _)| id.clone())
        .collect();

    let mut result = Vec::new();

    while let Some(id) = queue.pop() {
        result.push(id.clone());

        if let Some(neighbors) = adj.get(&id) {
            for neighbor in neighbors {
                if let Some(deg) = in_degree.get_mut(neighbor) {
                    *deg -= 1;
                    if *deg == 0 {
                        queue.push(neighbor.clone());
                    }
                }
            }
        }
    }

    if result.len() != tool_ids.len() {
        return Err("Failed to resolve all dependencies".to_string());
    }

    Ok(result)
}

/// Check if there's a cycle in the dependency graph
fn has_cycle(
    adj: &HashMap<String, Vec<String>>,
    node: &str,
    visited: &mut HashSet<String>,
    rec_stack: &mut HashSet<String>,
) -> bool {
    if rec_stack.contains(node) {
        return true;
    }
    if visited.contains(node) {
        return false;
    }

    visited.insert(node.to_string());
    rec_stack.insert(node.to_string());

    if let Some(neighbors) = adj.get(node) {
        for neighbor in neighbors {
            if has_cycle(adj, neighbor, visited, rec_stack) {
                return true;
            }
        }
    }

    rec_stack.remove(node);
    false
}

/// Get dependency tree for a tool
pub fn get_dependency_tree(tool_id: &str, installed_tools: &HashSet<String>) -> Result<DependencyTree, String> {
    let templates = template::list_all_templates();
    get_dependency_tree_with_templates(tool_id, installed_tools, &templates)
}

/// Get dependency tree with provided templates (for testing)
pub fn get_dependency_tree_with_templates(
    tool_id: &str,
    installed_tools: &HashSet<String>,
    templates: &[CliToolTemplate],
) -> Result<DependencyTree, String> {
    let template_map: HashMap<String, _> = templates
        .into_iter()
        .map(|t| (t.id.clone(), t))
        .collect();

    let mut total_tools = 0;
    let mut installed_count = 0;

    let root = build_dependency_tree_with_templates(
        tool_id,
        &template_map,
        installed_tools,
        &mut 0,
        &mut total_tools,
        &mut installed_count,
    )?;

    let missing_count = total_tools - installed_count;

    Ok(DependencyTree {
        root,
        total_tools,
        installed_count,
        missing_count,
    })
}

fn build_dependency_tree_with_templates(
    tool_id: &str,
    template_map: &HashMap<String, &CliToolTemplate>,
    installed_tools: &HashSet<String>,
    depth: &mut u32,
    total_tools: &mut usize,
    installed_count: &mut usize,
) -> Result<DependencyNode, String> {
    // Prevent infinite recursion
    *depth += 1;
    if *depth > 50 {
        return Err("Dependency tree too deep - possible circular dependency".to_string());
    }

    let template = template_map
        .get(tool_id)
        .ok_or_else(|| format!("Unknown tool ID: {}", tool_id))?;

    *total_tools += 1;
    let installed = installed_tools.contains(tool_id);
    if installed {
        *installed_count += 1;
    }

    let mut dependencies = Vec::new();
    if let Some(deps) = &template.dependencies {
        for dep_id in deps {
            // Avoid cycles in tree building
            if !template_map.contains_key(dep_id) {
                continue;
            }

            // Simple cycle detection for tree building
            if dep_id == tool_id {
                continue; // Skip self-dependencies
            }

            match build_dependency_tree_with_templates(
                dep_id,
                template_map,
                installed_tools,
                depth,
                total_tools,
                installed_count,
            ) {
                Ok(node) => dependencies.push(node),
                Err(_) => continue, // Skip problematic dependencies
            }
        }
    }

    *depth -= 1;

    Ok(DependencyNode {
        tool_id: tool_id.to_string(),
        name: template.name.clone(),
        installed,
        dependencies,
    })
}

/// Get reverse dependencies with names (for display purposes)
pub fn get_reverse_dependencies_with_names(
    tool_id: &str,
    templates: &[CliToolTemplate],
) -> Vec<(String, String)> {
    templates
        .iter()
        .filter(|t| {
            t.dependencies
                .as_ref()
                .map(|deps| deps.contains(&tool_id.to_string()))
                .unwrap_or(false)
        })
        .map(|t| (t.id.clone(), t.name.clone()))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_template(
        id: &str,
        name: &str,
        dependencies: Option<Vec<&str>>,
    ) -> CliToolTemplate {
        CliToolTemplate {
            id: id.to_string(),
            name: name.to_string(),
            executable: id.to_string(),
            version_command: "--version".to_string(),
            version_parser: "stdout".to_string(),
            config_files: vec![],
            install_methods: None,
            dependencies: dependencies.map(|deps| deps.iter().map(|s| s.to_string()).collect()),
        }
    }

    #[test]
    fn test_single_tool_no_dependencies() {
        let templates = vec![create_test_template("tool1", "Tool 1", None)];
        let tool_ids = vec!["tool1".to_string()];

        let result = resolve_installation_order_with_templates(&tool_ids, &templates);

        assert!(result.is_ok());
        let order = result.unwrap();
        assert_eq!(order, vec!["tool1"]);
    }

    #[test]
    fn test_two_tools_one_dependency() {
        let templates = vec![
            create_test_template("base", "Base Tool", None),
            create_test_template("dependent", "Dependent Tool", Some(vec!["base"])),
        ];
        let tool_ids = vec!["dependent".to_string(), "base".to_string()];

        let result = resolve_installation_order_with_templates(&tool_ids, &templates);

        assert!(result.is_ok());
        let order = result.unwrap();
        // Base should come before dependent
        assert_eq!(order, vec!["base", "dependent"]);
    }

    #[test]
    fn test_dependency_chain() {
        let templates = vec![
            create_test_template("a", "Tool A", None),
            create_test_template("b", "Tool B", Some(vec!["a"])),
            create_test_template("c", "Tool C", Some(vec!["b"])),
        ];
        let tool_ids = vec!["c".to_string(), "b".to_string(), "a".to_string()];

        let result = resolve_installation_order_with_templates(&tool_ids, &templates);

        assert!(result.is_ok());
        let order = result.unwrap();
        assert_eq!(order, vec!["a", "b", "c"]);
    }

    #[test]
    fn test_multiple_dependencies() {
        let templates = vec![
            create_test_template("a", "Tool A", None),
            create_test_template("b", "Tool B", None),
            create_test_template("c", "Tool C", Some(vec!["a", "b"])),
        ];
        let tool_ids = vec!["c".to_string(), "a".to_string(), "b".to_string()];

        let result = resolve_installation_order_with_templates(&tool_ids, &templates);

        assert!(result.is_ok());
        let order = result.unwrap();
        // A and B should come before C, but A and B can be in any order relative to each other
        let c_index = order.iter().position(|x| x == "c").unwrap();
        let a_index = order.iter().position(|x| x == "a").unwrap();
        let b_index = order.iter().position(|x| x == "b").unwrap();
        assert!(c_index > a_index);
        assert!(c_index > b_index);
    }

    #[test]
    fn test_diamond_dependency() {
        // Diamond: D depends on B and C, both B and C depend on A
        let templates = vec![
            create_test_template("a", "Tool A", None),
            create_test_template("b", "Tool B", Some(vec!["a"])),
            create_test_template("c", "Tool C", Some(vec!["a"])),
            create_test_template("d", "Tool D", Some(vec!["b", "c"])),
        ];
        let tool_ids = vec!["d".to_string(), "c".to_string(), "b".to_string(), "a".to_string()];

        let result = resolve_installation_order_with_templates(&tool_ids, &templates);

        assert!(result.is_ok());
        let order = result.unwrap();
        // A should be first, D should be last
        assert_eq!(order[0], "a");
        assert_eq!(order[3], "d");
    }

    #[test]
    fn test_circular_dependency_detection() {
        let templates = vec![
            create_test_template("a", "Tool A", Some(vec!["b"])),
            create_test_template("b", "Tool B", Some(vec!["a"])),
        ];
        let tool_ids = vec!["a".to_string(), "b".to_string()];

        let result = resolve_installation_order_with_templates(&tool_ids, &templates);

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Circular dependency"));
    }

    #[test]
    fn test_self_circular_dependency() {
        let templates = vec![create_test_template("a", "Tool A", Some(vec!["a"]))];
        let tool_ids = vec!["a".to_string()];

        let result = resolve_installation_order_with_templates(&tool_ids, &templates);

        // Self-dependencies should be caught
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Circular dependency"));
    }

    #[test]
    fn test_complex_circular_dependency() {
        let templates = vec![
            create_test_template("a", "Tool A", Some(vec!["b"])),
            create_test_template("b", "Tool B", Some(vec!["c"])),
            create_test_template("c", "Tool C", Some(vec!["a"])),
        ];
        let tool_ids = vec!["a".to_string(), "b".to_string(), "c".to_string()];

        let result = resolve_installation_order_with_templates(&tool_ids, &templates);

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Circular dependency"));
    }

    #[test]
    fn test_unknown_tool_id() {
        let templates = vec![create_test_template("a", "Tool A", None)];
        let tool_ids = vec!["a".to_string(), "unknown".to_string()];

        let result = resolve_installation_order_with_templates(&tool_ids, &templates);

        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Unknown tool ID"));
    }

    #[test]
    fn test_partial_dependency_set() {
        // Tool C depends on A and B, but we're only installing C and B (A is already installed)
        let templates = vec![
            create_test_template("a", "Tool A", None),
            create_test_template("b", "Tool B", None),
            create_test_template("c", "Tool C", Some(vec!["a", "b"])),
        ];
        let tool_ids = vec!["c".to_string(), "b".to_string()];

        let result = resolve_installation_order_with_templates(&tool_ids, &templates);

        assert!(result.is_ok());
        let order = result.unwrap();
        // B should come before C (A is not in the set so it's not considered)
        assert_eq!(order, vec!["b", "c"]);
    }

    #[test]
    fn test_dependency_tree_single_tool() {
        let templates = vec![create_test_template("a", "Tool A", None)];
        let installed: HashSet<String> = HashSet::new();

        let result = get_dependency_tree_with_templates("a", &installed, &templates);

        assert!(result.is_ok());
        let tree = result.unwrap();
        assert_eq!(tree.total_tools, 1);
        assert_eq!(tree.installed_count, 0);
        assert_eq!(tree.missing_count, 1);
        assert_eq!(tree.root.tool_id, "a");
        assert!(tree.root.dependencies.is_empty());
    }

    #[test]
    fn test_dependency_tree_with_dependencies() {
        let templates = vec![
            create_test_template("a", "Tool A", None),
            create_test_template("b", "Tool B", Some(vec!["a"])),
        ];
        let installed: HashSet<String> = HashSet::new();

        let result = get_dependency_tree_with_templates("b", &installed, &templates);

        assert!(result.is_ok());
        let tree = result.unwrap();
        assert_eq!(tree.total_tools, 2);
        assert_eq!(tree.installed_count, 0);
        assert_eq!(tree.missing_count, 2);
        assert_eq!(tree.root.tool_id, "b");
        assert_eq!(tree.root.dependencies.len(), 1);
        assert_eq!(tree.root.dependencies[0].tool_id, "a");
    }

    #[test]
    fn test_dependency_tree_with_installed_tools() {
        let templates = vec![
            create_test_template("a", "Tool A", None),
            create_test_template("b", "Tool B", Some(vec!["a"])),
        ];
        let mut installed: HashSet<String> = HashSet::new();
        installed.insert("a".to_string());

        let result = get_dependency_tree_with_templates("b", &installed, &templates);

        assert!(result.is_ok());
        let tree = result.unwrap();
        assert_eq!(tree.total_tools, 2);
        assert_eq!(tree.installed_count, 1);
        assert_eq!(tree.missing_count, 1);
        assert!(tree.root.dependencies[0].installed);
    }

    #[test]
    fn test_dependency_tree_deep_hierarchy() {
        let templates = vec![
            create_test_template("a", "Tool A", None),
            create_test_template("b", "Tool B", Some(vec!["a"])),
            create_test_template("c", "Tool C", Some(vec!["b"])),
            create_test_template("d", "Tool D", Some(vec!["c"])),
        ];
        let installed: HashSet<String> = HashSet::new();

        let result = get_dependency_tree_with_templates("d", &installed, &templates);

        assert!(result.is_ok());
        let tree = result.unwrap();
        assert_eq!(tree.total_tools, 4);
        assert_eq!(tree.installed_count, 0);
        assert_eq!(tree.missing_count, 4);
        // Verify the hierarchy
        assert_eq!(tree.root.tool_id, "d");
        assert_eq!(tree.root.dependencies[0].tool_id, "c");
        assert_eq!(tree.root.dependencies[0].dependencies[0].tool_id, "b");
        assert_eq!(tree.root.dependencies[0].dependencies[0].dependencies[0].tool_id, "a");
    }
}
