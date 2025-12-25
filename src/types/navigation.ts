export interface FeatureTab {
  id: string;
  label: string;
  icon: string;
  component: () => React.JSX.Element;
}

export interface NavigationState {
  activeTab: string;
  isCollapsed: boolean;
}
