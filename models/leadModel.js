export class LeadModel {
  constructor(db) {
    this.db = db; // Firestore instance
  }

  // Validate email format
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Save lead to Firestore
  async saveLead(name, email) {
    try {
      const leadData = {
        name,
        email,
        timestamp: new Date().toISOString(),
      };
      await this.db.collection("leads").add(leadData);
      console.log(`Lead saved to Firestore for ${name} (${email})`);
    } catch (error) {
      console.error(`Failed to save lead to Firestore: ${error.message}`);
      throw error;
    }
  }

  // Check if the user has interacted within the last 3 days
  async hasRecentInteraction(email) {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const querySnapshot = await this.db
        .collection("leads")
        .where("email", "==", email)
        .where("timestamp", ">=", threeDaysAgo.toISOString())
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        const lastInteraction = querySnapshot.docs[0].data();
        console.log(
          `Recent interaction found for ${email} at ${lastInteraction.timestamp}`
        );
        return true;
      }
      console.log(`No recent interaction found for ${email}`);
      return false;
    } catch (error) {
      console.error(`Error checking recent interaction: ${error.message}`);
      throw error;
    }
  }

  // Check and update rate limit for an IP address
  async checkRateLimit(ipAddress) {
    const RATE_LIMIT = 50; // 50 queries per hour
    const TIME_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

    try {
      const ipRef = this.db.collection("rateLimits").doc(ipAddress);
      const doc = await ipRef.get();

      const now = Date.now();
      let requestData = {
        count: 1,
        firstRequestTimestamp: now,
      };

      if (doc.exists) {
        requestData = doc.data();
        const elapsedTime = now - requestData.firstRequestTimestamp;

        if (elapsedTime > TIME_WINDOW) {
          // Reset the counter if the time window has expired
          requestData = {
            count: 1,
            firstRequestTimestamp: now,
          };
        } else {
          // Increment the counter
          requestData.count += 1;
        }
      }

      // Check if the limit is exceeded
      if (requestData.count > RATE_LIMIT) {
        console.log(`Rate limit exceeded for IP ${ipAddress}`);
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      // Update Firestore with the new request data
      await ipRef.set(requestData);
      console.log(
        `IP ${ipAddress} has made ${requestData.count} requests in the current window`
      );
      return true;
    } catch (error) {
      console.error(
        `Error checking rate limit for IP ${ipAddress}: ${error.message}`
      );
      throw error;
    }
  }
}
