//HTML要素を取得//
let expenseNameInput = document.getElementById("expenseNameInput");
let amount = document.getElementById("amount");
let date = document.getElementById("date");
let category = document.getElementById("category");
let addButton = document.getElementById("addButton");
let message = document.getElementById("message");
let expenseList = document.getElementById("expenseList");
let total = document.getElementById("total");
let categoryFilter = document.getElementById("categoryFilter");
let monthFilter = document.getElementById("monthFilter");
let sortFilter = document.getElementById("sortFilter");
let count = document.getElementById("count");
let cancelEditButton = document.getElementById("cancelEditButton");
let searchInput = document.getElementById("searchInput");

// 支出データを保存する配列//
let expenses = [];
let editingExpense = null;

//追加ボタンをクリックしたときの処理//
addButton.addEventListener("click", function () {

    //金額入力値を取得
    let amountValue = amount.value.trim();
    //金額を数値に変換
    let amountNumber = Number(amountValue);

    //支出名の入力値を取得//
    let expenseNameInputValue = expenseNameInput.value.trim();

    //日付の入力値を取得//
    let dateValue = date.value;

    //カテゴリの選択値を取得//
    let categoryValue = category.value;

    //支出名が空か確認//
    if (expenseNameInputValue === "") {
        message.textContent = "支出名を入力してください";
        //金額入力値が空か確認//
    } else if (amountValue === "") {
        message.textContent = "金額を入力してください";
        //金額が数字か確認//
    } else if (Number.isNaN(amountNumber)) {
        message.textContent = "数字を入力してください";
    } else if (amountNumber <= 0) {
        message.textContent = "1円以上の金額を入力してください";
    } else if (!Number.isInteger(amountNumber)) {
        message.textContent = "整数で入力してください";
        //日付が空か確認//
    } else if (dateValue === "") {
        message.textContent = "日付を入力してください";
        //カテゴリが未選択か確認//
    } else if (categoryValue === "") {
        message.textContent = "カテゴリを選択してください";
    } else {
        if (editingExpense === null) {
            let expenseData = {
                name: expenseNameInputValue,
                price: amountNumber,
                date: dateValue,
                category: categoryValue
            }
            expenses.push(expenseData);
            message.textContent = "追加しました";

        } else {
            message.textContent = "編集しました";
            editingExpense.name = expenseNameInputValue;
            editingExpense.price = amountNumber;
            editingExpense.date = dateValue;
            editingExpense.category = categoryValue;
            editingExpense = null;
        }
        // 支出データを保存//
        saveData();

        // 現在のカテゴリに合わせて一覧表示を更新//
        updateDisplay();

        cancelEditing();

    }
});
// 保存データを読み込む//
loadData();


categoryFilter.addEventListener("change", function () {
    // 選択カテゴリに合わせて一覧を更新//
    updateDisplay();
});

monthFilter.addEventListener("change", function () {
    updateDisplay();
});

searchInput.addEventListener("input", function () {
    updateDisplay();
});

sortFilter.addEventListener("change", function () {
    updateDisplay();
});

// 全削除ボタンを取得//
let clearButton = document.getElementById("clearButton");

// 全削除ボタンをクリックしたときの処理//
clearButton.addEventListener("click", function () {
    let isClear = confirm("本当にすべて削除しますか？");
    if (isClear === true) {
        // 支出データをすべて削除//
        expenses = [];

        cancelEditing();

        resetFilters();

        // 全削除後のデータを保存//
        saveData();
        // 全削除後も現在のカテゴリ表示を維持
        updateDisplay();
        // 全削除完了メッセージを表示//
        message.textContent = "全部削除しました";
    }
});




// 渡された支出データの合計金額を更新//
function updateTotal(totalExpenses) {
    // 支出の合計金額を計算/
    let sum = 0;
    totalExpenses.forEach(function (expenseData) {
        sum = sum + expenseData.price;
    });
    // 合計金額を表示//
    total.textContent = "合計:" + sum + "円";
}

function updateCount(displayExpenses) {
    count.textContent = "件数:" + displayExpenses.length + "件";
}

// 支出一覧を現在の配列から再表示//
function updateList(displayExpenses) {
    // 支出一覧を一度空にする//
    expenseList.textContent = "";
    if (displayExpenses.length === 0) {
        message.textContent = "該当する支出はありません";
    }
    // 支出データを1件ずつ表示する//
    displayExpenses.forEach(function (expenseData) {
        //liを作る//
        let item = document.createElement("li");
        // 支出データをliに表示//
        item.textContent =
            expenseData.name + " / " +
            expenseData.price + "円" + " / " +
            expenseData.date + " / " +
            expenseData.category;
        //liを支出一覧に追加/ /
        expenseList.append(item);

        let editButton = document.createElement("button");

        editButton.classList.add("edit");

        editButton.textContent = "編集";

        item.append(editButton);

        editButton.addEventListener("click", function () {
            editingExpense = expenseData;
            addButton.textContent = "更新";

            expenseNameInput.value = expenseData.name;
            amount.value = expenseData.price;
            date.value = expenseData.date;
            category.value = expenseData.category;
        });

        // 削除ボタンを作る//
        let button = document.createElement("button");

        button.classList.add("delete");

        button.textContent = "削除";

        // liに削除ボタンを追加//
        item.append(button);

        //削除ボタンにクリックイベント//
        button.addEventListener("click", function () {
            let isDelete = confirm("本当に削除しますか？");
            if (isDelete === true) {
                if (editingExpense === expenseData) {
                    cancelEditing();
                }
                expenses = expenses.filter(function (itemExpense) {
                    // 削除した支出以外を残す//
                    return itemExpense !== expenseData;
                });

                // 削除後のデータを保存//
                saveData();

                // 削除後も現在のカテゴリ表示を維持//
                updateDisplay();

            }
        });
    });
}
// 現在のカテゴリに合わせて一覧と合計を更新//
function updateDisplay() {
    // 現在選択中のカテゴリを取得
    let categorySelect = categoryFilter.value;
    let monthSelect = monthFilter.value;
    let sortSelect = sortFilter.value;
    let searchSelect = searchInput.value.trim().toLowerCase();
    let displayExpenses;

    if (monthSelect === "") {
        displayExpenses = expenses;
    } else {
        displayExpenses = expenses.filter(function (expenseData) {
            return expenseData.date.startsWith(monthSelect);
        });
    }

    //「すべて」が選ばれているか判定する//
    if (categorySelect !== "") {
        // 選択カテゴリだけ表示//
        // 選択カテゴリの支出だけ残す//
        displayExpenses = displayExpenses.filter(function (expenseData) {
            return expenseData.category === categorySelect;
        });
    }

    if (searchSelect !== "") {
        displayExpenses = displayExpenses.filter(function (expenseData) {
            return expenseData.name.toLowerCase().includes(searchSelect);
        });
    }


    if (sortSelect === "high") {
        displayExpenses.sort(function (a, b) {
            return b.price - a.price;
        });
    } else if (sortSelect === "low") {
        displayExpenses.sort(function (a, b) {
            return a.price - b.price;
        });
    } else {
        displayExpenses.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
    }
    // 絞り込んだ支出を表示//
    updateList(displayExpenses);
    // 表示中の支出の合計を更新//
    updateTotal(displayExpenses);

    updateCount(displayExpenses);
}





// 支出データをlocalStorageに保存//
function saveData() {
    // 配列を文字列に変換//
    let savedData = JSON.stringify(expenses);
    // localStorageに保存//
    localStorage.setItem("expenses", savedData);
}

// 保存した支出データを読み込む//
function loadData() {
    // localStorageから支出データを読み込む//
    let loadedData = localStorage.getItem("expenses");
    // 保存データがあるか確認
    if (loadedData !== null) {
        // 保存データを配列に戻す//
        expenses = JSON.parse(loadedData);
    }
    updateDisplay();
}

function resetForm() {
    expenseNameInput.value = "";
    amount.value = "";
    date.value = "";
    category.value = "";
}

function cancelEditing() {
    editingExpense = null;
    addButton.textContent = "追加";
    resetForm();
}

function resetFilters() {
    searchInput.value = "";
    categoryFilter.value = "";
    monthFilter.value = "";
    sortFilter.value = "";
}

cancelEditButton.addEventListener("click", function () {
    cancelEditing();
    message.textContent = "編集をキャンセルしました";
});




