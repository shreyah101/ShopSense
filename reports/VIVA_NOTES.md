# ShopSense — Viva Voce Preparation Notes
**Course:** Artificial Intelligence (CSE3002) &bull; **Institution:** Vellore Institute of Technology  
**Topic:** Unsupervised Customer Segmentation using K-Means and RFM Analysis  

---

## 1. What does ShopSense do?
ShopSense is an end-to-end unsupervised machine learning case study that takes raw, unlabeled transaction records from an online retailer and automatically discovers distinct **shopping personalities** (behavioral clusters). It groups customers based on how recently they bought, how often they buy, and how much they spend, visualizing the results and translating mathematical clusters into clear, plain-English profiles.

---

## 2. Why did we choose this problem?
In real-world retail and business analytics, customer intent is **unlabeled**. There is no "ground-truth" column indicating whether someone is a loyalist or a churn risk. Businesses need a principled, automated way to segment customers so they can allocate resources effectively, customize loyalty incentives, and reactivate dormant customers. This makes customer segmentation a classic, impactful application of **unsupervised machine learning**.

---

## 3. Which dataset did we use?
We used the genuine, official **UCI Online Retail Dataset (Dataset ID 352)**.
- **Source:** UCI Machine Learning Repository (Daqing Chen et al., 2012).
- **Domain:** UK-based online retailer specializing in unique all-occasion giftware.
- **Period:** December 1, 2010 to December 9, 2011.
- **Size:** 541,909 raw line-item transactions.
- **Cleaned Data:** 392,692 valid transactions across **4,338 unique customers** generating **£8,887,208.89** in total gross revenue.

---

## 4. How does the RFM framework work?
RFM summarizes transaction histories into three numerical dimensions per customer against a standardized reference horizon (December 10, 2011):
1. **Recency ($R$):** Days elapsed between the customer's latest purchase date and the reference horizon ($R = \text{Reference Date} - \max(\text{InvoiceDate})$). Lower is more active.
2. **Frequency ($F$):** Total count of unique, completed purchase invoices placed by that customer. Higher indicates steady repeat patronage.
3. **Monetary ($M$):** Cumulative spending across all valid purchase lines ($\sum \text{Quantity} \times \text{UnitPrice}$) in GBP (£).

---

## 5. What is K-Means clustering?
K-Means is a centroid-based unsupervised partitioning algorithm. Given $K$ clusters, it:
1. Initializes $K$ cluster centroids (we use `k-means++` initialization with seed 42).
2. Assigns each customer to the nearest centroid based on Euclidean distance in normalized feature space.
3. Recalculates centroids by taking the mean of all points assigned to that cluster.
4. Iterates until convergence, minimizing within-cluster sum of squares (Inertia):
   $$\text{Inertia} = \sum_{j=1}^{K} \sum_{x_i \in C_j} \|x_i - \mu_j\|^2$$

---

## 6. Why did we scale and log-transform the features?
- **Feature Scaling (StandardScaler):** Recency is measured in days ($1 \dots 374$), Frequency in orders ($1 \dots 209$), and Monetary in pounds (£$3.75 \dots £280,206$). Without scaling, Monetary would completely dominate the Euclidean distance calculation.
- **Log Transformation ($\ln(1+x)$):** Retail monetary and order frequency distributions are heavily right-skewed with extreme outliers (e.g. bulk wholesale buyers spending over £100,000). Applying $\log(1+x)$ normalizes feature variance, preventing single extreme outliers from distorting cluster centroids into degenerate, single-member clusters.

---

## 7. How did we select $K = 4$?
We evaluated candidate values from $K=2$ to $K=8$ across multiple criteria:
1. **Elbow Method:** Inertia drops sharply up to $K=4$, where the marginal reduction begins leveling off.
2. **Silhouette Score:** Has a local peak at $K=4$ ($0.3375$), outperforming $K=3$ ($0.3365$). While $K=2$ has a higher score ($0.4328$), it merely splits customers into active vs inactive, lacking retail utility.
3. **Cluster Size Balance:** At $K=4$, all clusters represent healthy segments ($16.4\%$, $19.3\%$, $27.0\%$, and $37.3\%$). At $K \ge 5$, clusters fragment into tiny subsets ($<7\%$).
4. **Davies-Bouldin Index:** Reaches a favorable low of $1.0086$ at $K=4$.

---

## 8. What does the Silhouette Score mean?
The Silhouette Coefficient ($s \in [-1, +1]$) measures how similar an object is to its own cluster (cohesion $a$) compared to other clusters (separation $b$):
$$s = \frac{b - a}{\max(a, b)}$$
- A score near $+1$ indicates points are tightly grouped in their own cluster and well-separated from neighbors.
- A score near $0$ indicates overlapping boundaries.
- Negative values mean points were likely assigned to the wrong cluster.

---

## 9. What do our 4 discovered customer personalities represent?
Derived by comparing cluster medians to population medians (Recency: 51 days, Frequency: 2 orders, Spend: £668.57):
1. **Cluster 3 — High-Value Champions (16.3%, 709 customers):**
   - Median: 8 days recency, 10 orders, £3,722.82 spend ($5.6\times$ population median).
   - *Strategy:* VIP perks, early product drops, priority customer service.
2. **Cluster 1 — At-Risk Valuable Shoppers (27.0%, 1,173 customers):**
   - Median: 55 days recency, 4 orders, £1,341.65 spend.
   - *Strategy:* Automated win-back campaigns and personalized reactivation incentives.
3. **Cluster 2 — Active Regular Shoppers (19.3%, 839 customers):**
   - Median: 17 days recency, 2 orders, £466.70 spend.
   - *Strategy:* Basket-building cross-sells, loyalty points, and free-shipping thresholds.
4. **Cluster 0 — Dormant Low-Engagement Shoppers (37.3%, 1,617 customers):**
   - Median: 177 days recency, 1 order, £298.40 spend.
   - *Strategy:* Cost-effective automated re-engagement or low marketing priority.

---

## 10. What is novel about ShopSense?
1. **Interpretable Personality Synthesis:** Rather than leaving clusters as opaque numbers ("Cluster 0, 1, 2"), the system automatically maps empirical medians against baseline distributions to generate plain-English explanations.
2. **Controlled Comparative Experiment:** Empirically demonstrates the pathological failure of Raw RFM (Experiment A, producing degenerate 0.3% outlier clusters) versus Log-Transformed RFM (Experiment B, producing balanced segments).
3. **Interactive 2D PCA & Real-Time Inference:** Fast, responsive React interface that lets users inspect 2D projections ($93.87\%$ variance captured) and test arbitrary shopping scenarios with outlier bounds checking.

---

## 11. Limitations
1. **Static Aggregation:** RFM condenses a year of history into single summary statistics, omitting temporal trends or seasonal spikes.
2. **Category Agnostic:** Does not incorporate product catalog diversity (e.g., giftware vs. home decor).
3. **Future Extension:** Combining RFM with sequential models (LSTM/Transformers) or probabilistic Gaussian Mixture Models (GMM) to estimate soft membership probabilities.

---

## 12. Five Likely Faculty Questions & Model Answers

### Q1: "Why did you use K-Means instead of a supervised classifier like Random Forest or SVM?"
**Answer:** "In real-world retail transactions, there are no ground-truth personality labels. Supervised algorithms require labeled training targets ($y$), which do not exist here. K-Means is an unsupervised algorithm that groups data points purely based on the geometric density and Euclidean distance between their behavioral features."

### Q2: "Why didn't you pick $K=2$ when its silhouette score ($0.4328$) is higher than $K=4$ ($0.3375$)?"
**Answer:** "In clustering, maximizing a mathematical score alone can lead to trivial or uninformative solutions. $K=2$ simply divides shoppers into 'active' and 'inactive', which any basic filter could do. $K=4$ has a local silhouette peak while unlocking four distinct, operationally actionable tiers (Champions, At-Risk Spenders, Regulars, and Dormant), all while maintaining healthy cluster sizes above 16%."

### Q3: "What happens if a user enters an extreme value like £500,000 in your predictor?"
**Answer:** "The prediction pipeline includes outlier validation. If an input exceeds the historical training boundaries (e.g. max spend was £280,206), the system maps the point mathematically using the fitted log1p-scaler pipeline, but flags an explicit Outlier Warning to the user indicating the observation lies outside the training distribution."

### Q4: "Why did you compute PCA if the model was already trained on RFM?"
**Answer:** "K-Means was trained directly on the three standardized RFM features. PCA was computed strictly as a dimensionality reduction step to project the 3D feature space onto 2 dimensions for human visualization. The first two principal components capture 93.87% of the total variance, confirming that the 2D scatter plot faithfully represents the high-dimensional clusters."

### Q5: "How did you handle cancelled orders and returns in the dataset?"
**Answer:** "During preprocessing, invoice numbers starting with 'C' (e.g., C536379) were identified as cancellations and systematically filtered. Furthermore, transactions with non-positive quantities ($Q \le 0$) or zero/negative unit prices were removed, ensuring that cumulative revenue was calculated solely from verified completed sales."

