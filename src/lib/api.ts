import { collection, getDocs, doc, getDoc, addDoc, updateDoc, setDoc, deleteDoc, serverTimestamp, query, limit, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

export interface ProductOffer {
  active: boolean;
  type: 'color' | 'image' | 'none';
  value: string;
  endDate: string;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  sizes: string[];
  stock: number;
  offer: ProductOffer;
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  createdAt?: any;
}

export interface Order {
  id: string;
  items: any[];
  total: number;
  status: 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

export interface UserProfile {
  email: string;
  cart: any[];
  favorites: string[];
  orders: Order[];
  createdAt?: any;
}

export const getProducts = async (): Promise<Product[]> => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getCategories = async (): Promise<Category[]> => {
  const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export const addCategory = async (name: string) => {
  const docRef = await addDoc(collection(db, 'categories'), {
    name,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const deleteCategory = async (id: string) => {
  await deleteDoc(doc(db, 'categories', id));
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(4));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, 'products', id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Product;
  }
  return null;
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'products'), {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
};

export const uploadImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const uploadImageResumable = (file: File) => {
  // Clean filename to prevent issues
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '');
  const storageRef = ref(storage, `products/${Date.now()}_${safeName}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  const getUrl = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        async () => {
          try {
            const url = await getDownloadURL(storageRef);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  };

  return { uploadTask, getUrl };
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', userId);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }
  return null;
};

export const createUserProfile = async (userId: string, email: string) => {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, {
    email,
    cart: [],
    favorites: [],
    orders: [],
    createdAt: serverTimestamp(),
  });
};

export const updateUserProfileData = async (userId: string, updates: { cart?: any[], favorites?: string[], orders?: Order[] }) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, updates);
};
