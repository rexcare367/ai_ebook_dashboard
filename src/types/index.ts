import { Icons } from '@/components/icons';

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
  permission: string[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export interface IUser {
  email: string;
  id: string;
  last_login: string | null;
  name: string;
  role: string;
  current_role: string;
  school_id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  school: {
    id: string;
    name: string;
    state: string;
    city: string;
    status: string;
    students_count: number;
    created_at: string;
    updated_at: string;
  } | null;
}
