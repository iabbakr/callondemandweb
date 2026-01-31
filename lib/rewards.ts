import {
  doc,
  getDoc,
  increment,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// ✅ Daily Check-In Logic
export async function handleDailyCheckIn(userId: string): Promise<{
  rewarded: boolean;
  streak: number;
}> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return { rewarded: false, streak: 0 };

  const data = userSnap.data();
  const today = new Date();
  const lastCheckIn = data.lastCheckIn ? data.lastCheckIn.toDate() : null;
  const streak = data.streakCount || 0;

  let newStreak = streak;

  if (lastCheckIn === null) {
    newStreak = 1;
    await updateDoc(userRef, { streakCount: newStreak, lastCheckIn: serverTimestamp() });
    return { rewarded: false, streak: newStreak };
  }

  const dayDiff = Math.floor((today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));
  if (dayDiff < 1) return { rewarded: false, streak }; 

  newStreak = (dayDiff === 1) ? streak + 1 : 1;

  if (newStreak >= 7) {
    await updateDoc(userRef, {
      bonusBalance: increment(10),
      streakCount: 0,
      lastCheckIn: serverTimestamp(),
    });
    return { rewarded: true, streak: 0 };
  }

  await updateDoc(userRef, { streakCount: newStreak, lastCheckIn: serverTimestamp() });
  return { rewarded: false, streak: newStreak };
}

// ✅ Corrected Redeem Logic (Fixed n.indexOf issue)
export const redeemBonus = async (userId: string, amount: number) => {
  if (!userId) throw new Error("userId is required for redemption");
  if (amount <= 0) return;

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    bonusBalance: increment(-amount),
    balance: increment(amount),
  });

  // Log redemption in transaction history
  const txRef = collection(db, "users", userId, "transactions");
  await addDoc(txRef, {
    description: "Bonus Coin Redemption",
    amount: amount,
    category: "Reward",
    type: "credit",
    status: "success",
    date: serverTimestamp(),
  });
};