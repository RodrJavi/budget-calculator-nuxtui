export type Entry = {
  title: string;
  amount: number;
  importance?: string;
};

export type User = {
  user: {
    username: string;
    budgetList: {
      incomeList: Entry[];
      expenseList: Entry[];
    };
    iat: number;
    exp: number;
  };
};

export type BudgetList = {
  incomeList: Entry[];
  expenseList: Entry[];
};
