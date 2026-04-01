export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export const useBreadcrumb = () => {
  const items = useState<BreadcrumbItem[]>("breadcrumb", () => []);

  const set = (newItems: BreadcrumbItem[]) => {
    items.value = newItems;
  };

  return { items, set };
};
