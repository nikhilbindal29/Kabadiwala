export const ROLES = {
  SELLER: 'SELLER',
  COLLECTOR: 'COLLECTOR',
  BUYER: 'BUYER',
  RECYCLER: 'RECYCLER',
  ADMIN: 'ADMIN',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, { en: string; hi: string }> = {
  SELLER: { en: 'Seller', hi: 'विक्रेता' },
  COLLECTOR: { en: 'Kabadiwala', hi: 'कबाड़ीवाला' },
  BUYER: { en: 'Buyer', hi: 'खरीदार' },
  RECYCLER: { en: 'Recycler', hi: 'रिसाइकलर' },
  ADMIN: { en: 'Admin', hi: 'व्यवस्थापक' },
};

export const ROLE_DESCRIPTIONS: Record<Role, { en: string; hi: string }> = {
  SELLER: {
    en: 'List your e-waste for pickup and sale',
    hi: 'अपना ई-कचरा बिक्री के लिए सूचीबद्ध करें',
  },
  COLLECTOR: {
    en: 'Collect, sort and sell recyclable materials',
    hi: 'रिसाइकल योग्य सामग्री एकत्र करें और बेचें',
  },
  BUYER: {
    en: 'Buy bulk recyclable materials',
    hi: 'थोक में रिसाइकल योग्य सामग्री खरीदें',
  },
  RECYCLER: {
    en: 'Source materials for authorized recycling',
    hi: 'अधिकृत रिसाइक्लिंग के लिए सामग्री प्राप्त करें',
  },
  ADMIN: {
    en: 'Manage platform operations',
    hi: 'प्लेटफ़ॉर्म संचालन प्रबंधित करें',
  },
};
