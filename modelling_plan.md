# ETF2121 — Statistical Modelling Chapter Plan
## Weeks 6–11 | Part 3: Statistical Modelling with R

---

> **Design principles**
> - One unified story throughout: FreshMart, an Australian supermarket chain
> - All tools are free and open-source (R, tidyverse, tidymodels, tidyclust)
> - Every code block runs interactively via **webR** (`{webr-r}` chunks)
> - Packages prioritised: `tidyverse`, `tidymodels`, `tidyclust`, `GGally`, `corrr`, `patchwork`
> - Students arrive with first-year statistics only (mean, SD, normal distribution, correlation, basic hypothesis testing, p-values)
> - Each section ends with **Concept Recall** questions and **R Practice** exercises, both with full solutions
> - Tone: warm, guided, real-world — "you are a junior analyst at FreshMart"

---

## Data Setup (used across all chapters)

The modelling chapters use a **derived FreshMart analysis dataset** built from the Transactions and Customers tables. This dataset is created once in the introductory section and reused in every subsequent chapter.

```
freshmart_customers — one row per customer
  CustomerID, FirstName, City, JoinDate, LoyaltyPoints, TotalSpend,
  TotalTransactions, AvgTransactionValue, DaysSinceFirstPurchase,
  IsHighValue (TotalSpend > 500 → TRUE/FALSE),
  SpendCategory ("Low" / "Medium" / "High")
```

The dataset is provided as a CSV hosted on GitHub so webR can load it directly with `readr::read_csv()`. No database connection is needed in the modelling chapters.

---

## Chapter 6 — Introduction to R & Exploratory Data Analysis
**Week 6 · Tue 27 Aug**

### Chapter Learning Objectives
By the end of this chapter, students will be able to:
1. Navigate R and RStudio (Posit) for data analysis work
2. Load and inspect the FreshMart dataset using `readr` and `dplyr`
3. Calculate summary statistics using `dplyr` (mean, median, SD, counts)
4. Create publication-quality plots with `ggplot2` (histogram, boxplot, scatter plot)
5. Describe the shape, centre, and spread of a distribution using both words and code
6. Identify potential relationships between variables using scatter plots and correlation

### Chapter Narrative
> "You've just joined FreshMart's analytics team. Your first task: understand who our customers are before the modelling team builds any predictive models. Let's explore the data."

---

### Section 6.1 — Why R for Business Analytics?
**Content:** R's role in industry; why free/open-source matters; the tidyverse philosophy ("data in, insight out"); brief comparison to Excel. Introduce the FreshMart story.

**Concept Recall Box:**
> Q1: What does "open-source" mean, and why might a business prefer it?
> Q2: Name two things R can do that Excel cannot easily do.
> *(Solutions: brief prose answers provided)*

---

### Section 6.2 — Your First Look at the FreshMart Data
**Content:** Loading data with `readr::read_csv()`; `dplyr::glimpse()`, `head()`, `summary()`; understanding data types (numeric, character, logical, date). Introduce the `freshmart_customers` tibble.

**Key packages:** `readr`, `dplyr`

**webR Exercise 6.2.1 — Load and inspect**
```r
library(tidyverse)

freshmart <- read_csv("https://raw.githubusercontent.com/.../freshmart_customers.csv")
glimpse(freshmart)
head(freshmart, 10)
summary(freshmart$TotalSpend)
```
*Task:* How many customers are in the dataset? What is the data type of `IsHighValue`?
*Solution provided.*

**Concept Recall — Section 6.2**
> Q1: What does a tibble look like compared to a regular data frame?
> Q2: What does `summary()` show for a numeric variable vs. a character variable?

---

### Section 6.3 — Descriptive Statistics with dplyr
**Content:** `summarise()`, `group_by()`, `mutate()`, `filter()`, `arrange()`. Calculating mean, median, standard deviation, min/max by group (e.g., by City, by SpendCategory).

**Recall link to first-year stats:** Briefly review mean vs. median (skewed data); standard deviation as "average distance from the mean."

**webR Exercise 6.3.1 — Summary by city**
```r
freshmart |>
  group_by(City) |>
  summarise(
    n_customers   = n(),
    avg_spend     = mean(TotalSpend),
    median_spend  = median(TotalSpend),
    sd_spend      = sd(TotalSpend)
  ) |>
  arrange(desc(avg_spend))
```
*Task:* Which city has the highest average spend? Is the mean or median higher — what does that tell you?

**webR Exercise 6.3.2 — High-value customers**
```r
freshmart |>
  filter(IsHighValue == TRUE) |>
  summarise(
    count       = n(),
    pct_total   = n() / nrow(freshmart) * 100,
    avg_loyalty = mean(LoyaltyPoints)
  )
```

**Concept Recall — Section 6.3**
> Q1: Why might median be a better measure of "typical spend" than mean for customer data?
> Q2: What does a large standard deviation in `TotalSpend` tell the marketing team?
> Q3: Write the dplyr code to find the top 5 customers by LoyaltyPoints. *(Solution: `arrange(desc(LoyaltyPoints)) |> slice_head(n = 5)`)*

---

### Section 6.4 — Visualising Distributions with ggplot2
**Content:** The grammar of graphics (data → aesthetics → geometry); histograms (`geom_histogram`); density curves (`geom_density`); customising with `labs()`, `theme_minimal()`. Interpreting skewness and outliers visually.

**Recall link to first-year stats:** Normal distribution, skewness.

**webR Exercise 6.4.1 — Histogram of TotalSpend**
```r
ggplot(freshmart, aes(x = TotalSpend)) +
  geom_histogram(bins = 30, fill = "#8FBFCA", colour = "white") +
  labs(
    title = "Distribution of Customer Total Spend — FreshMart",
    x = "Total Spend ($AUD)",
    y = "Number of Customers"
  ) +
  theme_minimal()
```
*Task:* Describe the shape of the distribution. Is it symmetric, left-skewed, or right-skewed?

**webR Exercise 6.4.2 — Boxplot by SpendCategory**
```r
ggplot(freshmart, aes(x = SpendCategory, y = TotalSpend, fill = SpendCategory)) +
  geom_boxplot(alpha = 0.7) +
  scale_fill_manual(values = c("#F0EBE3", "#8FBFCA", "#9B8EC7")) +
  labs(title = "Spend Distribution by Category", x = NULL, y = "Total Spend ($AUD)") +
  theme_minimal() +
  theme(legend.position = "none")
```

**Concept Recall — Section 6.4**
> Q1: What does the box in a boxplot represent?
> Q2: In ggplot2, what does `aes()` stand for and what goes inside it?
> Q3: A histogram has a long right tail. What type of skewness is this?

---

### Section 6.5 — Relationships Between Variables
**Content:** Scatter plots with `geom_point()` and `geom_smooth()`; `GGally::ggpairs()` for pairwise exploration; `corrr::correlate()` for a correlation matrix. Interpreting direction and strength of association.

**Recall link to first-year stats:** Correlation coefficient (r), range −1 to +1, causation ≠ correlation.

**webR Exercise 6.5.1 — Scatter: LoyaltyPoints vs TotalSpend**
```r
ggplot(freshmart, aes(x = LoyaltyPoints, y = TotalSpend, colour = SpendCategory)) +
  geom_point(alpha = 0.6) +
  geom_smooth(method = "lm", se = TRUE, colour = "#9B8EC7") +
  labs(title = "Loyalty Points vs Total Spend", x = "Loyalty Points", y = "Total Spend ($)") +
  theme_minimal()
```

**webR Exercise 6.5.2 — Correlation matrix with corrr**
```r
library(corrr)

freshmart |>
  select(TotalSpend, LoyaltyPoints, TotalTransactions, AvgTransactionValue, DaysSinceFirstPurchase) |>
  correlate() |>
  rplot(print_cor = TRUE)
```
*Task:* Which variable is most strongly correlated with `TotalSpend`? Is this surprising?

**Concept Recall — Section 6.5**
> Q1: If r = 0.85, describe the relationship in plain English.
> Q2: A scatter plot shows a curved relationship. Can we use a linear correlation coefficient? Why/why not?
> Q3: FreshMart finds that customers with more loyalty points also spend more. Does this mean the loyalty program *causes* higher spending? Explain.

---

### Section 6.6 — Chapter Exercises (Mixed)
8 end-of-chapter exercises combining concept recall and R code tasks, ranging from "describe what this output means" to "modify this code to answer a different question." Full solutions provided in a collapsible callout block (`:::{.callout-tip collapse="true"} ### Solution`).

---

## Chapter 7 — Linear Regression
**Week 7 · Tue 9 Sep**

### Chapter Learning Objectives
1. Explain what a regression model does and why it is useful
2. Fit a simple linear regression model in R using `parsnip` (tidymodels)
3. Interpret regression coefficients in a business context
4. Assess model fit using R² and RMSE
5. Extend to multiple predictors and identify important variables
6. Use `broom::tidy()` and `broom::glance()` to extract model results cleanly

### Chapter Narrative
> "The Head of Marketing asks: can we predict how much a new customer will spend over their lifetime, based on how they behave in their first few weeks? If we can, we can prioritise which new sign-ups deserve a special welcome offer."

**Target variable:** `TotalSpend`
**Predictors:** `LoyaltyPoints`, `TotalTransactions`, `DaysSinceFirstPurchase`, `City`

---

### Section 7.1 — What Is Regression?
**Content:** The line of best fit concept (recall from first-year stats); y = β₀ + β₁x; what "best fit" means (minimising squared errors — intuitive explanation with a diagram). Introduce the FreshMart prediction problem.

**Concept Recall — Section 7.1**
> Q1: In y = 50 + 3x, what does the number 3 represent?
> Q2: What does "least squares" mean in plain language?
> Q3: If we plot TotalSpend on the y-axis and LoyaltyPoints on the x-axis, what would a positive slope mean for FreshMart?

---

### Section 7.2 — Fitting a Simple Linear Regression in R
**Content:** The tidymodels workflow: `linear_reg()` → `set_engine("lm")` → `fit()`. Why use tidymodels over base `lm()`? (Consistent interface, easy to switch engines/models later). Using `broom::tidy()` and `broom::glance()`.

**webR Exercise 7.2.1 — First model**
```r
library(tidymodels)

lm_spec <- linear_reg() |>
  set_engine("lm")

lm_fit <- lm_spec |>
  fit(TotalSpend ~ LoyaltyPoints, data = freshmart)

tidy(lm_fit)
glance(lm_fit)
```
*Task:* Write out the fitted equation. For every 100 extra loyalty points, how much more does a customer spend on average?

**webR Exercise 7.2.2 — Visualise the fitted line**
```r
augment(lm_fit, new_data = freshmart) |>
  ggplot(aes(x = LoyaltyPoints, y = TotalSpend)) +
  geom_point(alpha = 0.4, colour = "#8FBFCA") +
  geom_line(aes(y = .pred), colour = "#9B8EC7", linewidth = 1) +
  labs(title = "Fitted Regression Line: TotalSpend ~ LoyaltyPoints") +
  theme_minimal()
```

**Concept Recall — Section 7.2**
> Q1: What does R² = 0.72 mean in plain English?
> Q2: `tidy()` shows a p-value for LoyaltyPoints of 0.0001. What does this mean?
> Q3: What is a residual? Draw a diagram.

---

### Section 7.3 — Multiple Linear Regression
**Content:** Adding more predictors; interpreting coefficients while holding others constant; categorical predictors and dummy variables (using `recipes::step_dummy()`).

**webR Exercise 7.3.1 — Multiple regression with recipe**
```r
freshmart_recipe <- recipe(TotalSpend ~ LoyaltyPoints + TotalTransactions + City, 
                           data = freshmart) |>
  step_dummy(City)

lm_workflow <- workflow() |>
  add_recipe(freshmart_recipe) |>
  add_model(lm_spec)

lm_multi_fit <- lm_workflow |>
  fit(data = freshmart)

tidy(lm_multi_fit)
```

**Concept Recall — Section 7.3**
> Q1: You add a new variable to the model and R² increases from 0.72 to 0.73. Is this always a good sign?
> Q2: What does it mean when a coefficient for `CityMelbourne` = 45.2 in a regression?
> Q3: Why do we use dummy variables for categorical predictors?

---

### Section 7.4 — Model Evaluation and Predictions
**Content:** Train/test split with `rsample::initial_split()`; RMSE and R² on test data using `yardstick`; making predictions for new customers; overfitting intuition.

**webR Exercise 7.4.1 — Train/test split and evaluation**
```r
set.seed(42)
split <- initial_split(freshmart, prop = 0.75)
train <- training(split)
test  <- testing(split)

lm_final_fit <- lm_workflow |> fit(data = train)

predictions <- augment(lm_final_fit, new_data = test)

metrics(predictions, truth = TotalSpend, estimate = .pred)
```

**webR Exercise 7.4.2 — Predict a new customer**
```r
new_customer <- tibble(
  LoyaltyPoints    = 800,
  TotalTransactions = 12,
  City             = "Melbourne"
)

predict(lm_final_fit, new_data = new_customer)
```

**Concept Recall — Section 7.4**
> Q1: A model has very low RMSE on training data but high RMSE on test data. What is happening?
> Q2: Why do we evaluate on test data rather than training data?
> Q3: RMSE = $120. In this context (predicting TotalSpend), is this a good or bad result? What would you compare it against?

---

### Section 7.5 — Chapter Exercises (Mixed)
10 exercises. Includes: interpreting model output tables, adjusting the recipe, writing prediction code for specific FreshMart scenarios (e.g., "predict spend for a new customer who joined 30 days ago with 200 points in Brisbane"). Full solutions in collapsible callouts.

---

## Chapter 8 — Logistic Regression
**Week 8 · Tue 16 Sep**

### Chapter Learning Objectives
1. Explain when a classification model is needed instead of regression
2. Interpret the logistic function and understand predicted probabilities
3. Fit a logistic regression model using `parsnip` + `workflows`
4. Read and interpret a confusion matrix
5. Calculate and explain accuracy, sensitivity, and specificity in a business context
6. Adjust the classification threshold and understand the trade-off

### Chapter Narrative
> "FreshMart's loyalty team wants to target customers at risk of becoming inactive before they do. Can we predict whether a customer will become 'high value' (TotalSpend > $500) based on their early behaviour? This is now a yes/no question — we need a different kind of model."

**Target variable:** `IsHighValue` (TRUE / FALSE)
**Predictors:** `LoyaltyPoints`, `TotalTransactions`, `DaysSinceFirstPurchase`, `City`

---

### Section 8.1 — When the Outcome Is Yes or No
**Content:** Motivating example (churn, fraud, disease diagnosis); why linear regression fails for binary outcomes (predicts outside 0–1); the logistic (sigmoid) function; probabilities vs. classes. Illustrated with a diagram showing the S-curve.

**Concept Recall — Section 8.1**
> Q1: Why can't we use a regular linear regression when the outcome is TRUE/FALSE?
> Q2: The logistic function always outputs values between ___ and ___.
> Q3: A model outputs a probability of 0.73 for a customer. What does this mean?

---

### Section 8.2 — Fitting Logistic Regression in R
**Content:** `logistic_reg()` in parsnip; factor outcome variables; `recipes::step_dummy()` for categorical predictors; workflow assembly.

**webR Exercise 8.2.1 — Prepare the data and fit the model**
```r
freshmart_clf <- freshmart |>
  mutate(IsHighValue = as.factor(IsHighValue))

set.seed(42)
clf_split <- initial_split(freshmart_clf, prop = 0.75, strata = IsHighValue)
clf_train <- training(clf_split)
clf_test  <- testing(clf_split)

lr_spec <- logistic_reg() |>
  set_engine("glm")

lr_recipe <- recipe(IsHighValue ~ LoyaltyPoints + TotalTransactions + City,
                    data = clf_train) |>
  step_dummy(City) |>
  step_normalize(all_numeric_predictors())

lr_workflow <- workflow() |>
  add_recipe(lr_recipe) |>
  add_model(lr_spec)

lr_fit <- lr_workflow |> fit(data = clf_train)
tidy(lr_fit)
```

**Concept Recall — Section 8.2**
> Q1: Why do we use `step_normalize()` for logistic regression?
> Q2: What does `strata = IsHighValue` do in `initial_split()`?

---

### Section 8.3 — Evaluating Classification: The Confusion Matrix
**Content:** What a confusion matrix is; TP, TN, FP, FN; accuracy, sensitivity (recall), specificity; `yardstick::conf_mat()` and `yardstick::metrics()`. Business interpretation: "it's worse to miss a high-value customer (FN) than to incorrectly flag one (FP)."

**webR Exercise 8.3.1 — Confusion matrix**
```r
lr_preds <- augment(lr_fit, new_data = clf_test)

conf_mat(lr_preds, truth = IsHighValue, estimate = .pred_class)

classification_metrics <- metric_set(accuracy, sensitivity, specificity)
classification_metrics(lr_preds, truth = IsHighValue, estimate = .pred_class)
```

**webR Exercise 8.3.2 — ROC curve**
```r
lr_preds |>
  roc_curve(truth = IsHighValue, .pred_TRUE) |>
  autoplot() +
  labs(title = "ROC Curve — High Value Customer Classifier")
```

**Concept Recall — Section 8.3**
> Q1: Accuracy = 0.90 but the dataset is 90% negative cases. Is this a good model?
> Q2: For FreshMart's use case, which is more damaging: a false positive or a false negative? Why?
> Q3: What does AUC (area under the ROC curve) measure?

---

### Section 8.4 — Adjusting the Threshold
**Content:** Default threshold of 0.5; changing it to improve sensitivity; business trade-offs.

**webR Exercise 8.4.1 — Custom threshold**
```r
lr_preds |>
  mutate(pred_custom = as.factor(if_else(.pred_TRUE > 0.35, "TRUE", "FALSE"))) |>
  conf_mat(truth = IsHighValue, estimate = pred_custom)
```

**Concept Recall — Section 8.4**
> Q1: Lowering the threshold from 0.5 to 0.3 — what happens to sensitivity? To specificity?
> Q2: FreshMart would rather flag too many customers as high-value than miss real ones. Should they raise or lower the threshold?

---

### Section 8.5 — Chapter Exercises (Mixed)
10 exercises. Includes scenario-based confusion matrix interpretation, modifying the model recipe, predicting whether Marcus Lee would be classified as high-value vs. Jake Nguyen. Full solutions provided.

---

## Chapter 9 — Regression Trees
**Week 9 · Tue 23 Sep**

### Chapter Learning Objectives
1. Explain how a decision tree splits data using simple rules
2. Fit a regression tree with `parsnip` (rpart engine) and `workflows`
3. Visualise a tree and interpret its splits in a business context
4. Explain and demonstrate overfitting in trees; use pruning (tree depth)
5. Compare tree predictions to linear regression on the same problem

### Chapter Narrative
> "The linear regression model predicts customer spend reasonably well, but the marketing team wants to understand it better. They ask: 'Can you show us in simple rules which customers tend to spend the most?' A decision tree speaks their language."

**Target variable:** `TotalSpend`
**Predictors:** `LoyaltyPoints`, `TotalTransactions`, `DaysSinceFirstPurchase`, `City`

---

### Section 9.1 — How Trees Make Decisions
**Content:** The binary splitting idea; "which question best separates the data?"; impurity/variance reduction; illustrated with a hand-drawn style diagram of a small FreshMart tree (e.g., "Is LoyaltyPoints > 600? If yes → avg spend = $820, if no → avg spend = $210").

**Concept Recall — Section 9.1**
> Q1: In plain language, what does a decision tree do at each split?
> Q2: A tree with depth 20 perfectly fits the training data. Is this a good thing?
> Q3: What does "pruning" a tree mean?

---

### Section 9.2 — Fitting a Regression Tree in R
**Content:** `decision_tree()` in parsnip with `set_engine("rpart")`; `set_mode("regression")`; the `tree_depth` and `min_n` hyperparameters; `rpart.plot::rpart.plot()` for visualisation.

**webR Exercise 9.2.1 — Fit and visualise**
```r
tree_spec <- decision_tree(tree_depth = 4, min_n = 10) |>
  set_engine("rpart") |>
  set_mode("regression")

tree_workflow <- workflow() |>
  add_recipe(recipe(TotalSpend ~ LoyaltyPoints + TotalTransactions + City,
                    data = train) |> step_dummy(City)) |>
  add_model(tree_spec)

tree_fit <- tree_workflow |> fit(data = train)

# Visualise
library(rpart.plot)
tree_fit |>
  extract_fit_engine() |>
  rpart.plot(roundint = FALSE, type = 4, extra = 101)
```

**webR Exercise 9.2.2 — Evaluate vs linear regression**
```r
tree_preds <- augment(tree_fit, new_data = test)
lm_preds   <- augment(lm_final_fit, new_data = test)

bind_rows(
  metrics(tree_preds, truth = TotalSpend, estimate = .pred) |> mutate(model = "Tree"),
  metrics(lm_preds,  truth = TotalSpend, estimate = .pred) |> mutate(model = "Linear Regression")
)
```

**Concept Recall — Section 9.2**
> Q1: The tree's RMSE is lower than linear regression on training data but higher on test data. Explain what this means.
> Q2: What does `tree_depth = 1` produce? What would it look like?

---

### Section 9.3 — Overfitting and Tree Depth
**Content:** Show side-by-side RMSE for depth = 1, 3, 6, 10 using a simple loop; identify the "sweet spot"; introduce the concept of cross-validation (preview for KNN chapter).

**webR Exercise 9.3.1 — Depth experiment**
```r
depths <- c(1, 2, 3, 4, 5, 8, 10)

depth_results <- map_dfr(depths, function(d) {
  spec <- decision_tree(tree_depth = d) |>
    set_engine("rpart") |> set_mode("regression")
  
  wf <- workflow() |>
    add_recipe(recipe(TotalSpend ~ LoyaltyPoints + TotalTransactions + City,
                      data = train) |> step_dummy(City)) |>
    add_model(spec)
  
  fit <- wf |> fit(data = train)
  
  bind_rows(
    augment(fit, new_data = train) |>
      rmse(truth = TotalSpend, estimate = .pred) |>
      mutate(set = "Train", depth = d),
    augment(fit, new_data = test) |>
      rmse(truth = TotalSpend, estimate = .pred) |>
      mutate(set = "Test", depth = d)
  )
})

ggplot(depth_results, aes(x = depth, y = .estimate, colour = set)) +
  geom_line() + geom_point() +
  labs(title = "RMSE vs Tree Depth", x = "Tree Depth", y = "RMSE ($)") +
  theme_minimal()
```

**Concept Recall — Section 9.3**
> Q1: At what tree depth does overfitting start in the plot above?
> Q2: Name one advantage and one disadvantage of decision trees compared to linear regression.

---

### Section 9.4 — Chapter Exercises (Mixed)
8 exercises. Includes: reading a printed tree output and writing business rules in plain English; tuning depth; interpreting the depth-RMSE chart; comparing trees and linear regression on the FreshMart test set. Full solutions.

---

## Chapter 10 — K-Nearest Neighbours (KNN)
**Week 10 · Tue 30 Sep**

### Chapter Learning Objectives
1. Explain the KNN algorithm in plain language
2. Understand why feature scaling is essential for KNN
3. Fit a KNN classifier using `parsnip` + `workflows` + `recipes`
4. Use cross-validation (`vfold_cv`) to choose the optimal K
5. Evaluate KNN performance and compare to logistic regression on the same FreshMart problem

### Chapter Narrative
> "The data team is experimenting with different classifiers. KNN is appealingly intuitive: 'Tell me about 5 customers who are most similar to this new customer — and I'll predict based on what they did.' Let's build it for FreshMart."

**Task:** Classify customers as `IsHighValue` (TRUE/FALSE) — same problem as Chapter 8.

---

### Section 10.1 — The Nearest Neighbours Idea
**Content:** Illustrated example with 2D customer plot (LoyaltyPoints × TotalTransactions); how majority vote works for K=3 and K=7; effect of large vs small K; real-world analogy ("ask your 3 closest neighbours what restaurant to go to").

**Concept Recall — Section 10.1**
> Q1: With K=1, what happens on the training data? Is this a good model?
> Q2: As K increases, does the decision boundary become more or less smooth?
> Q3: Customer A has LoyaltyPoints=900, TotalTransactions=15. The 5 nearest neighbours are: HIGH, HIGH, LOW, HIGH, LOW. What does KNN predict?

---

### Section 10.2 — Why We Must Scale Features
**Content:** Distance calculation example showing how LoyaltyPoints (0–5000) dominates AvgTransactionValue (0–200) without scaling; `step_normalize()` in recipes fixes this.

**webR Exercise 10.2.1 — See scaling in action**
```r
recipe(IsHighValue ~ LoyaltyPoints + TotalTransactions + AvgTransactionValue,
       data = clf_train) |>
  step_normalize(all_numeric_predictors()) |>
  prep() |>
  bake(new_data = NULL) |>
  summary()
```
*Task:* Compare mean and SD before and after normalisation. What are they after?

**Concept Recall — Section 10.2**
> Q1: Without scaling, a variable with large values will have more / less influence on distance. (Choose one.)
> Q2: `step_normalize()` transforms each variable to have mean = ___ and SD = ___.

---

### Section 10.3 — Fitting KNN in R
**Content:** `nearest_neighbor()` in parsnip; `set_mode("classification")`; workflow pipeline.

**webR Exercise 10.3.1 — Fit KNN with K=5**
```r
knn_spec <- nearest_neighbor(neighbors = 5) |>
  set_engine("kknn") |>
  set_mode("classification")

knn_recipe <- recipe(IsHighValue ~ LoyaltyPoints + TotalTransactions + AvgTransactionValue,
                     data = clf_train) |>
  step_normalize(all_numeric_predictors())

knn_workflow <- workflow() |>
  add_recipe(knn_recipe) |>
  add_model(knn_spec)

knn_fit <- knn_workflow |> fit(data = clf_train)

augment(knn_fit, new_data = clf_test) |>
  conf_mat(truth = IsHighValue, estimate = .pred_class)
```

---

### Section 10.4 — Choosing K with Cross-Validation
**Content:** Why we can't pick K using the test set (data leakage); v-fold cross-validation intuition (split training data into v folds, rotate); `tune::tune_grid()` with `vfold_cv()`.

**webR Exercise 10.4.1 — Tune K from 1 to 20**
```r
knn_tune_spec <- nearest_neighbor(neighbors = tune()) |>
  set_engine("kknn") |>
  set_mode("classification")

knn_grid <- tibble(neighbors = 1:20)
cv_folds <- vfold_cv(clf_train, v = 5, strata = IsHighValue)

knn_tune_wf <- workflow() |>
  add_recipe(knn_recipe) |>
  add_model(knn_tune_spec)

knn_results <- tune_grid(knn_tune_wf, resamples = cv_folds, grid = knn_grid)

collect_metrics(knn_results) |>
  filter(.metric == "accuracy") |>
  ggplot(aes(x = neighbors, y = mean)) +
  geom_line() + geom_point() +
  labs(title = "CV Accuracy vs K", x = "K (neighbours)", y = "CV Accuracy") +
  theme_minimal()
```

**Concept Recall — Section 10.4**
> Q1: What is data leakage and why does it matter?
> Q2: With 5-fold cross-validation, how many times is each data point used for validation?
> Q3: The CV accuracy peaks at K=7 then slowly decreases. What does this suggest about K=7?

---

### Section 10.5 — KNN vs Logistic Regression
**Content:** Side-by-side comparison of accuracy, sensitivity, specificity on the same test set; when to prefer each; KNN's lack of interpretability.

**webR Exercise 10.5.1 — Compare models**
```r
best_k <- select_best(knn_results, metric = "accuracy")
final_knn <- finalize_workflow(knn_tune_wf, best_k) |> fit(data = clf_train)

knn_test_preds <- augment(final_knn, new_data = clf_test)
lr_test_preds  <- augment(lr_fit,   new_data = clf_test)

bind_rows(
  classification_metrics(knn_test_preds, truth = IsHighValue, estimate = .pred_class) |> mutate(model = "KNN"),
  classification_metrics(lr_test_preds,  truth = IsHighValue, estimate = .pred_class) |> mutate(model = "Logistic Regression")
)
```

**Concept Recall — Section 10.5**
> Q1: KNN achieves higher accuracy than logistic regression, but the marketing manager cannot explain it to the CEO. What is the trade-off being described?
> Q2: Name a situation where you would prefer KNN over logistic regression.

---

### Section 10.6 — Chapter Exercises (Mixed)
10 exercises. Includes: hand-tracing KNN on a small table; modifying the feature set; explaining a CV accuracy plot; predicting for Gary McSnarl, Marcus Lee, and Amara Diallo. Full solutions provided.

---

## Chapter 11 — Clustering
**Week 11 · Tue 7 Oct**

### Chapter Learning Objectives
1. Distinguish supervised from unsupervised learning
2. Explain the K-means algorithm step-by-step
3. Fit a K-means clustering model using `tidyclust` + `workflows`
4. Use the elbow method and silhouette score to choose the number of clusters
5. Profile and name customer segments in a business context
6. Visualise clusters with `ggplot2` and present findings to a non-technical audience

### Chapter Narrative
> "There's no 'right answer' variable now. The CMO asks: 'Are all our customers the same? Or are there natural groups we should be treating differently?' K-means clustering will help us find the answer — without any labelled data."

**Input variables:** `TotalSpend`, `TotalTransactions`, `LoyaltyPoints`, `DaysSinceFirstPurchase`
(all from `freshmart_customers`)

---

### Section 11.1 — Supervised vs Unsupervised Learning
**Content:** The fundamental distinction; supervised = labelled outcome; unsupervised = discover hidden structure; real examples (customer segmentation, anomaly detection, topic modelling). Position clustering in the context of everything learned so far.

**Concept Recall — Section 11.1**
> Q1: In chapters 7–10 we always had a target variable. What changes in this chapter?
> Q2: Name one real-world business problem that clustering could address.
> Q3: If clustering finds 3 groups, does that mean there are exactly 3 types of customers in reality?

---

### Section 11.2 — The K-Means Algorithm
**Content:** Step-by-step illustrated walkthrough: (1) initialise K random centroids; (2) assign each point to nearest centroid; (3) recalculate centroids; (4) repeat until stable. Animated-style diagram or step-by-step table. Emphasise: K-means uses distance → scaling required.

**Concept Recall — Section 11.2**
> Q1: Why must we scale variables before running K-means?
> Q2: K-means is sensitive to the initial random placement of centroids. How does `set.seed()` help?
> Q3: K-means converges when _____________________.

---

### Section 11.3 — Fitting K-Means with tidyclust
**Content:** `k_means()` from `tidyclust`; recipe with `step_normalize()`; workflow; `extract_cluster_assignment()`.

**webR Exercise 11.3.1 — Fit K=3**
```r
library(tidyclust)
library(tidymodels)

km_data <- freshmart |>
  select(CustomerID, TotalSpend, TotalTransactions, LoyaltyPoints, DaysSinceFirstPurchase)

km_recipe <- recipe(~ TotalSpend + TotalTransactions + LoyaltyPoints + DaysSinceFirstPurchase,
                    data = km_data) |>
  step_normalize(all_numeric_predictors())

km_spec <- k_means(num_clusters = 3)

km_workflow <- workflow() |>
  add_recipe(km_recipe) |>
  add_model(km_spec)

set.seed(42)
km_fit <- km_workflow |> fit(data = km_data)

extract_cluster_assignment(km_fit)
```

**webR Exercise 11.3.2 — Add cluster labels back**
```r
freshmart_clustered <- freshmart |>
  bind_cols(extract_cluster_assignment(km_fit))

freshmart_clustered |>
  group_by(.cluster) |>
  summarise(
    n            = n(),
    avg_spend    = mean(TotalSpend),
    avg_txns     = mean(TotalTransactions),
    avg_loyalty  = mean(LoyaltyPoints)
  ) |>
  arrange(desc(avg_spend))
```

**Concept Recall — Section 11.3**
> Q1: `extract_cluster_assignment()` returns a column called `.cluster`. What values can it take for K=3?
> Q2: Two customers are assigned to Cluster 2. Does this mean they are identical?

---

### Section 11.4 — Choosing K: The Elbow Method
**Content:** Within-cluster sum of squares (WSS) intuition; `sse_within_total_vec()` from tidyclust; plot WSS against K; identify the "elbow" (diminishing returns). Silhouette scores as an alternative: `silhouette_avg()`.

**webR Exercise 11.4.1 — Elbow plot**
```r
k_vals <- 1:8

wss_results <- map_dfr(k_vals, function(k) {
  spec <- k_means(num_clusters = k)
  wf   <- workflow() |> add_recipe(km_recipe) |> add_model(spec)
  set.seed(42)
  fit  <- wf |> fit(data = km_data)
  tibble(k = k, wss = sse_within_total_vec(fit, km_data))
})

ggplot(wss_results, aes(x = k, y = wss)) +
  geom_line(colour = "#9B8EC7") + geom_point(colour = "#9B8EC7", size = 3) +
  labs(title = "Elbow Method — Choosing K", x = "Number of Clusters (K)", y = "Total WSS") +
  theme_minimal()
```

**Concept Recall — Section 11.4**
> Q1: WSS always decreases as K increases. Why?
> Q2: At K=4 the WSS drops sharply, but at K=5 it barely changes. What does this suggest?
> Q3: Is there a single objectively "correct" number of clusters?

---

### Section 11.5 — Visualising and Naming Clusters
**Content:** 2D scatter plot of clusters (using top 2 PCA dimensions or just the two most important variables); naming segments based on profile summaries; applying FreshMart characters to the segments; business recommendations.

**webR Exercise 11.5.1 — Visualise clusters**
```r
ggplot(freshmart_clustered, aes(x = LoyaltyPoints, y = TotalSpend, colour = .cluster)) +
  geom_point(alpha = 0.6, size = 2) +
  scale_colour_manual(values = c("#9B8EC7", "#8FBFCA", "#F0EBE3")) +
  labs(title = "FreshMart Customer Segments", 
       x = "Loyalty Points", y = "Total Spend ($AUD)",
       colour = "Segment") +
  theme_minimal()
```

**webR Exercise 11.5.2 — Name the segments**

After profiling, students label each cluster:

| Cluster | Avg Spend | Avg Transactions | Suggested Name |
|---------|-----------|-----------------|----------------|
| 1 | $1,200 | 28 | 🌟 "Loyal Champions" |
| 2 | $380 | 9 | 💛 "Occasional Shoppers" |
| 3 | $85 | 2 | 💤 "Dormant / At Risk" |

Students match FreshMart characters to segments (Marcus Lee → Champion; Gary McSnarl → Dormant; Jake Nguyen → Occasional).

**Concept Recall — Section 11.5**
> Q1: FreshMart has 3 segments. Write one marketing recommendation for each segment.
> Q2: Segment 3 ("Dormant") has very low spend. What action might FreshMart take for these customers?
> Q3: A new customer makes 1 purchase of $40 and earns 40 points. Which segment would you expect them to fall into?

---

### Section 11.6 — Chapter Exercises (Mixed)
10 exercises. Includes: re-running the model with different K values; re-profiling with an extra variable (City); hand-labelling a small clustering example; writing a 3-slide business summary of the clustering findings. Full solutions. Final exercise asks students to write a short memo to the FreshMart CMO explaining what the three segments are and what action to take — bridging statistical modelling and business communication.

---

## Cross-Cutting Design Notes

### Exercise Structure (all chapters)
Each section ends with:

**Concept Recall** (2–4 questions)
- Multiple choice or short answer
- Tests understanding of the concept, not the code
- Solutions in a `:::{.callout-tip collapse="true"} ### Solution` block

**R Practice** (1–3 webR chunks)
- Modify/extend existing code
- New FreshMart scenario (e.g., "repeat this for Sydney customers only")
- Solutions in a `:::{.callout-tip collapse="true"} ### Solution` block

**End-of-chapter exercises** (8–10 mixed questions)
- Mix of concept and code
- Scaffolded: first few are fill-in-the-blank, later ones are open-ended
- Final exercise is always a "business communication" task (write a sentence/memo explaining the result)

---

### Package List (all chapters)
| Package | Source | Purpose |
|---------|--------|---------|
| `tidyverse` | posit/tidyverse | dplyr, ggplot2, readr, tidyr, purrr |
| `tidymodels` | posit | rsample, recipes, parsnip, workflows, yardstick, broom, tune, dials |
| `tidyclust` | posit | K-means clustering with tidymodels interface |
| `corrr` | tidymodels | Tidy correlation matrices |
| `GGally` | community | `ggpairs()` for EDA |
| `patchwork` | community | Combine ggplot2 plots |
| `rpart.plot` | community | Tree visualisation |
| `kknn` | community | KNN engine for parsnip |

All packages are free and available on CRAN. All code runs in webR via `{webr-r}` chunks.

---

### File Names (to add to `_quarto.yml`)
```
- part: Statistical Modelling with R
  chapters:
    - intro_r.qmd         # Week 6 — Introduction to R & EDA
    - linear_reg.qmd      # Week 7 — Linear Regression
    - logistic_reg.qmd    # Week 8 — Logistic Regression
    - reg_trees.qmd       # Week 9 — Regression Trees
    - knn.qmd             # Week 10 — K-Nearest Neighbours
    - clustering.qmd      # Week 11 — Clustering
```

---

### Animation References & Inspiration

Resources to borrow ideas from when building interactive plotly animations for teaching concepts:

| Resource | URL | What to borrow |
|----------|-----|----------------|
| Machine Learning Visualized | https://github.com/gavinkhung/machine-learning-visualized | Step-by-step algorithm animations (KNN, K-means, decision boundaries, gradient descent) — good reference for frame pacing, what state to highlight per step, and how to convey convergence visually |

**Key ideas from Machine Learning Visualized:**
- Show algorithm *state* at each step (not just the final result) — centroids moving, neighbours being highlighted, decision boundaries shifting
- Colour is used deliberately: one colour per class/cluster, neutral for "undecided" state
- Annotations and labels update with each frame so the viewer knows what changed
- Slow frame duration for complex steps, faster for simple transitions

---

### Data File
A `freshmart_customers.csv` must be created and hosted (GitHub raw URL) with the following derived variables from Transactions + Customers:

```
CustomerID, FirstName, City, JoinDate,
LoyaltyPoints, TotalSpend,
TotalTransactions, AvgTransactionValue,
DaysSinceFirstPurchase,
IsHighValue (TotalSpend > 500),
SpendCategory ("Low" <200 / "Medium" 200-500 / "High" >500)
```

Approximately 500 rows to make modelling exercises meaningful. Can be generated synthetically using `fabricatr` or `simstudy`, ensuring FreshMart characters appear at known row positions.
