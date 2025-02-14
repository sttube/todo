export type TODO = {
  id: string;
  numId: number;
  ord: number;
  status: string;
  title?: string;
  todoType?: {
    [key: string]: boolean;
  };
  taskDv?: number;
  dtmStart?: string;
  dtmEnd?: string;
  dtmDeadLine?: string;
  rmark?: string;
};
