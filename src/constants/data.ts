import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

export type Admin = {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  current_role: string;
  createdAt: string;
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
  school_id: string;
  updatedAt: string;
  last_login: string | null;
};

export type School = {
  id: string;
  name: string;
  state: string;
  city: string;
  status: string;
  students_count: number;
  created_at: string;
  updated_at: string;
};

export type AnalysisResult = {
  id: string;
  school_name: string;
  state: string;
  city: string;
  status: string;
  students_count: number;
  created_at: string;
  updated_at: string;
  total_students: number;
  count_of_registered_students: number;
  percent_of_registered_students: number;
  count_of_active_students: number;
  percent_of_active_students: number;
};

export type User = {
  id: string;
  ic_number: string;
  email: string;
  name: string;
  birth: string;
  address: string;
  parent: any;
  rewards: any[];
  school_id: string;
  registration_status: string;
  created_at: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [], // Empty array as there are no child items for Dashboard
    permission: ['admin', 'school_manager']
  },
  {
    title: 'Product',
    url: '/dashboard/product',
    icon: 'product',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [],
    permission: ['demo']
  },
  {
    title: 'Admins',
    url: '/dashboard/admin',
    icon: 'user',
    shortcut: ['a', 'a'],
    isActive: false,
    items: [],
    permission: ['admin']
  },
  {
    title: 'Data Analysis',
    url: '/dashboard/analysis',
    icon: 'user',
    shortcut: ['a', 'a'],
    isActive: false,
    items: [],
    permission: ['admin']
  },
  {
    title: 'Schools',
    url: '/dashboard/schools',
    icon: 'school',
    shortcut: ['a', 'a'],
    isActive: false,
    items: [],
    permission: ['admin']
  },
  {
    title: 'School Statistics',
    url: '/dashboard/school_statistics',
    icon: 'user',
    shortcut: ['s', 's'],
    isActive: false,
    items: [],
    permission: ['school_manager']
  },
  {
    title: 'Students',
    url: '#',
    icon: 'user',
    shortcut: ['a', 'a'],
    isActive: false,
    items: [
      {
        title: 'All',
        url: '/dashboard/students/all',
        icon: 'userPen',
        shortcut: ['m', 'm'],
        permission: ['admin', 'school_manager']
      },
      {
        title: 'Registered Students',
        url: '/dashboard/students/registered',
        icon: 'userPen',
        shortcut: ['m', 'm'],
        permission: ['admin', 'school_manager']
      }
    ],
    permission: ['admin', 'school_manager']
  },
  {
    title: 'Account',
    url: '#', // Placeholder as there is no direct link for the parent
    icon: 'billing',
    isActive: true,
    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm'],
        permission: ['admin', 'school_manager']
      }
    ],
    permission: ['admin', 'school_manager']
  },
  {
    title: 'Kanban',
    url: '/dashboard/kanban',
    icon: 'kanban',
    shortcut: ['k', 'k'],
    isActive: false,
    items: [],
    permission: ['demo']
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
