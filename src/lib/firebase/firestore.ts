
import { db } from "./config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  getDoc,
  where
} from "firebase/firestore";

export interface Video {
  id: string;
  title: string;
  link: string;
  thumbnail: string;
  category: string;
  synopsis: string;
  createdAt: number;
}

const VIDEOS_COLLECTION = "videos";

export async function addVideo(video: Omit<Video, "id" | "createdAt">) {
  const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), {
    ...video,
    createdAt: Date.now(),
  });
  return docRef.id;
}

export async function getVideos(category?: string): Promise<Video[]> {
  const videosCol = collection(db, VIDEOS_COLLECTION);
  let q = query(videosCol, orderBy("createdAt", "desc"));
  
  if (category && category !== "All") {
    q = query(videosCol, where("category", "==", category), orderBy("createdAt", "desc"));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Video));
}

export async function getVideo(id: string): Promise<Video | null> {
  const docRef = doc(db, VIDEOS_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Video;
  }
  return null;
}

export async function deleteVideo(id: string) {
  const docRef = doc(db, VIDEOS_COLLECTION, id);
  await deleteDoc(docRef);
}

export const CATEGORIES = ["All", "Tech", "Nature", "Entertainment", "Education", "Lifestyle"];
