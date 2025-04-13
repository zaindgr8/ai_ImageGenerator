import { auth, db, storage } from "./firebase";
import {
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString,
  listAll,
  StorageReference,
} from "firebase/storage";

// Auth functions
export const logoutUser = () => firebaseSignOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  return firebaseSignOut(auth);
};

// Firestore functions
export const addDocument = (collectionName: string, data: any) =>
  addDoc(collection(db, collectionName), data);

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateDocument = (collectionName: string, id: string, data: any) =>
  updateDoc(doc(db, collectionName, id), data);

export const deleteDocument = (collectionName: string, id: string) =>
  deleteDoc(doc(db, collectionName, id));

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  timestamp: number;
  model: string;
}

export const saveImageToStorage = async (
  user: User,
  imageUrl: string,
  prompt: string,
  model: string
): Promise<string> => {
  if (!user) throw new Error("User not authenticated");

  try {
    console.log("Starting to save image reference to Firestore");

    // Create document in Firestore instead of using Storage
    const timestamp = Date.now();

    // Save directly to Firestore for better performance
    const imageData = {
      imageUrl,
      prompt,
      model,
      timestamp,
      userId: user.uid,
    };

    // Add to a 'images' collection
    await addDoc(collection(db, "images"), imageData);

    console.log("Image reference saved successfully to Firestore");
    return imageUrl;
  } catch (error) {
    console.error("Error saving image reference:", error);
    throw error;
  }
};

export const getUserImages = async (user: User): Promise<GeneratedImage[]> => {
  if (!user) return [];

  console.log("Starting to fetch user images from Firestore");

  try {
    // Query Firestore for all documents in the 'images' collection belonging to this user
    const imagesQuery = collection(db, "images");
    const querySnapshot = await getDocs(imagesQuery);

    const images: GeneratedImage[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include images belonging to this user
      if (data.userId === user.uid) {
        images.push({
          imageUrl: data.imageUrl,
          prompt: data.prompt,
          timestamp: data.timestamp,
          model: data.model,
        });
      }
    });

    // Sort images by timestamp (newest first)
    images.sort((a, b) => b.timestamp - a.timestamp);

    console.log(
      `Successfully retrieved ${images.length} images from Firestore`
    );
    return images;
  } catch (error) {
    console.error("Error fetching user images from Firestore:", error);
    return [];
  }
};
