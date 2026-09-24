export interface NavItem {
  label: string;
  href: string;
}

export interface NavGroup {
  heading: string;
  items: readonly NavItem[];
}

export interface Brand {
  name: string;
  href: string;
}
