import { collection, addDoc, doc, setDoc, getDocs } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../config/firebase";

// Check if initial data exists
export const checkInitialDataExists = async () => {
  try {
    // First try to sign in as admin to check data
    try {
      await signInWithEmailAndPassword(
        auth,
        "admin@diskumperindag.com",
        "admin123"
      );
      const marketsSnapshot = await getDocs(collection(db, "markets"));
      const usersSnapshot = await getDocs(collection(db, "users"));
      await signOut(auth);
      return marketsSnapshot.size > 0 && usersSnapshot.size > 0;
    } catch (authError) {
      // If admin doesn't exist, data doesn't exist
      return false;
    }
  } catch (error) {
    console.error("Error checking initial data:", error);
    return false;
  }
};

// Setup initial data for Firebase
export const setupInitialData = async () => {
  try {
    console.log("Setting up initial data...");

    // Create a temporary admin user first for setup
    let tempAdminCreated = false;
    try {
      const tempAdminCredential = await createUserWithEmailAndPassword(
        auth,
        "temp@setup.com",
        "tempsetup123"
      );

      // Give temp admin privileges
      await setDoc(doc(db, "users", tempAdminCredential.user.uid), {
        username: "Temp Setup Admin",
        email: "temp@setup.com",
        role: "admin",
        pasar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isTemp: true,
      });

      tempAdminCreated = true;
      console.log("Temporary admin created for setup");
    } catch (error) {
      console.log("Could not create temp admin, proceeding with existing auth");
    }

    // 1. Create Markets
    const markets = [
      "Sumowono",
      "Bandarjo",
      "Projo",
      "Ambarawa",
      "Jimbaran",
      "Bandungan",
      "Bergas",
      "Ungaran",
    ];

    console.log("Creating markets...");
    for (const marketName of markets) {
      await addDoc(collection(db, "markets"), {
        name: marketName,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
    }

    // 2. Create Units
    const units = ["Kg", "Liter", "Ons", "Buah", "Ikat", "Gram"];

    console.log("Creating units...");
    for (const unitName of units) {
      await addDoc(collection(db, "units"), {
        name: unitName,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
    }

    // 3. Create Commodities
    const commodities = [
      { name: "Beras Cap C4 (Medium)", unit: "Kg" },
      { name: "Beras Cap C4 (Premium)", unit: "Kg" },
      { name: "Beras SPHP Bulog", unit: "Kg" },
      { name: "Kedelai Impor", unit: "Kg" },
      { name: "Cabai Merah Keriting", unit: "Kg" },
      { name: "Cabai Rawit", unit: "Kg" },
      { name: "Bawang Merah", unit: "Kg" },
      { name: "Bawang Putih", unit: "Kg" },
      { name: "Minyak Goreng Curah", unit: "Liter" },
      { name: "Gula Pasir", unit: "Kg" },
      { name: "Telur Ayam", unit: "Kg" },
      { name: "Daging Ayam", unit: "Kg" },
      { name: "Daging Sapi", unit: "Kg" },
      { name: "Ikan Lele", unit: "Kg" },
      { name: "Ikan Nila", unit: "Kg" },
    ];

    console.log("Creating commodities...");
    for (const commodity of commodities) {
      await addDoc(collection(db, "commodities"), {
        name: commodity.name,
        unit: commodity.unit,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
    }

    // Clean up temp admin if created
    if (tempAdminCreated) {
      await signOut(auth);
    }

    console.log("Initial data setup completed!");
    return true;
  } catch (error) {
    console.error("Error setting up initial data:", error);
    throw error;
  }
};

// Create demo users with Firebase Authentication
export const createDemoUsers = async () => {
  try {
    console.log("Creating demo users...");

    const demoUsers = [
      {
        email: "admin@diskumperindag.com",
        password: "admin123",
        username: "Administrator",
        role: "admin",
        pasar: null,
      },
      {
        email: "sumowono@diskumperindag.com",
        password: "user123",
        username: "Petugas Sumowono",
        role: "user",
        pasar: "Sumowono",
      },
      {
        email: "bandarjo@diskumperindag.com",
        password: "user123",
        username: "Petugas Bandarjo",
        role: "user",
        pasar: "Bandarjo",
      },
      {
        email: "projo@diskumperindag.com",
        password: "user123",
        username: "Petugas Projo",
        role: "user",
        pasar: "Projo",
      },
      {
        email: "ambarawa@diskumperindag.com",
        password: "user123",
        username: "Petugas Ambarawa",
        role: "user",
        pasar: "Ambarawa",
      },
    ];

    for (const userData of demoUsers) {
      try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );

        // Update display name
        await updateProfile(userCredential.user, {
          displayName: userData.username,
        });

        // Save user data to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          username: userData.username,
          email: userData.email,
          role: userData.role,
          pasar: userData.pasar,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        });

        console.log(`Created user: ${userData.email}`);

        // Sign out after creating each user
        await signOut(auth);
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          console.log(`User ${userData.email} already exists, skipping...`);
        } else {
          console.error(`Error creating user ${userData.email}:`, error);
        }
      }
    }

    console.log("Demo users creation completed!");
    return true;
  } catch (error) {
    console.error("Error creating demo users:", error);
    throw error;
  }
};

// Create sample market data
export const createSampleMarketData = async () => {
  try {
    console.log("Creating sample market data...");

    // Sign in as admin to create sample data
    await signInWithEmailAndPassword(
      auth,
      "admin@diskumperindag.com",
      "admin123"
    );

    // Get commodities and markets
    const commoditiesSnapshot = await getDocs(collection(db, "commodities"));
    const marketsSnapshot = await getDocs(collection(db, "markets"));

    const commodities = [];
    const markets = [];

    commoditiesSnapshot.forEach((doc) => {
      commodities.push({ id: doc.id, ...doc.data() });
    });

    marketsSnapshot.forEach((doc) => {
      markets.push({ id: doc.id, ...doc.data() });
    });

    // Create sample data for today and yesterday
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dates = [
      today.toISOString().split("T")[0],
      yesterday.toISOString().split("T")[0],
    ];

    for (const date of dates) {
      for (const market of markets) {
        // Create data for first 5 commodities only (to avoid too much data)
        for (let i = 0; i < Math.min(5, commodities.length); i++) {
          const commodity = commodities[i];

          // Generate random merchant prices
          const merchantPrices = [];
          const numMerchants = Math.floor(Math.random() * 3) + 2; // 2-4 merchants

          for (let j = 1; j <= numMerchants; j++) {
            const basePrice = 10000 + i * 5000; // Different base price per commodity
            const variation = Math.floor(Math.random() * 2000) - 1000; // ±1000
            merchantPrices.push({
              id: j,
              name: `Pedagang ${j}`,
              price: basePrice + variation,
            });
          }

          // Calculate averages
          const avgToday = Math.round(
            merchantPrices.reduce((sum, m) => sum + m.price, 0) /
              merchantPrices.length
          );
          const avgYesterday =
            avgToday + Math.floor(Math.random() * 1000) - 500;

          await addDoc(collection(db, "marketData"), {
            date: date,
            market: market.name,
            commodityId: commodity.id,
            commodity: {
              id: commodity.id,
              name: commodity.name,
              unit: commodity.unit,
            },
            merchantPrices: merchantPrices,
            avgToday: avgToday,
            avgYesterday: avgYesterday,
            notes: "-",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    await signOut(auth);
    console.log("Sample market data created!");
    return true;
  } catch (error) {
    console.error("Error creating sample market data:", error);
    throw error;
  }
};
