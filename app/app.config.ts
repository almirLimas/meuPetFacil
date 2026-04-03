export default defineAppConfig({
  ui: {
    colors: {
      primary: "sky",
      secondary: "orange",
    },
    button: {
      defaultVariants: {
        color: "secondary",
      },
    },
    modal: {
      slots: {
        content:
          "bg-white dark:bg-neutral-900 divide-y divide-default flex flex-col focus:outline-none",
      },
    },
  },
});
