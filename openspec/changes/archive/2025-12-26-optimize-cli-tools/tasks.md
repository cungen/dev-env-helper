## 1. Performance Optimization
- [x] 1.1 Implement parallel CLI tool detection in Rust (use rayon or tokio)
- [ ] 1.2 Add timing/benchmarking to measure improvement
- [ ] 1.3 Test with 20+ tools to verify performance gains

## 2. UI Simplification
- [x] 2.1 Redesign CliToolCard to show only: name, emoji icon, install status badge, version
- [x] 2.2 Change CliToolsPage layout from list to responsive grid (multiple columns)
- [x] 2.3 Create CliToolDetailDialog component with full tool information
- [x] 2.4 Update CliToolsPage to handle card click → open dialog
- [x] 2.5 Remove collapsible config files from card (move to dialog)
- [x] 2.6 Update card styling to match simplified design and grid layout
- [x] 2.7 Add detection method display to detail dialog (e.g., "detected by which <executable>")
- [x] 2.8 Add installation method display to detail dialog with formatted commands (e.g., "brew install <formula>", "brew install --cask <cask>")

## 3. Category Support
- [x] 3.1 Extract CategoryFilter component to shared location
- [x] 3.2 Add category and emoji fields to CliToolTemplate type (Rust)
- [x] 3.3 Add category and emoji to TypeScript CliToolTemplate interface
- [x] 3.4 Define default categories for built-in CLI tools
- [x] 3.5 Update CliToolsPage to support category filtering
- [x] 3.6 Update software recommendations to use shared CategoryFilter component

## 4. Installation Feedback
- [x] 4.1 Create InstallationProgressDialog component
- [x] 4.2 Update useToolInstallation to expose log output state
- [x] 4.3 Integrate progress dialog into CliToolsPage installation flow
- [x] 4.4 Add error highlighting and formatting in log output
- [ ] 4.5 Test with various installation methods (brew, dmg, script)

## 5. Testing & Validation
- [ ] 5.1 Verify detection performance improvement (measure before/after)
- [ ] 5.2 Test category filtering with various category combinations
- [ ] 5.3 Test installation progress dialog with success and error cases
- [ ] 5.4 Verify backward compatibility with existing custom templates
- [ ] 5.5 Test shared CategoryFilter component in both features

