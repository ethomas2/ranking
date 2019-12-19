export type ElectionResponseType = {
  // maybe id should be a number? would have to convert to number when it comes
  // in from backend
  id: string;
  title: string;
  body: string[][];
  header: string[];
  leftCol: string[];
};
