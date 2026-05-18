export interface Folder {
  _id: string;
  name: string;
  parentFolder: string | null;
  addedDate?: string;
}
