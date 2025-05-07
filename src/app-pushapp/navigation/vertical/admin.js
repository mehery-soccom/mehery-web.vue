export default [
  { heading: "Admin" },
  {
    title: "Apps",
    icon: { icon: "tabler-plug" },
    children: [
      { title: "List", to: "admin-channels-list" },
      { title: "Add", to: "admin-channels-add" },
    ],
  },
  {
    title: "Push Notification",
    icon: { icon: "tabler-bell-ringing" },
    children: [
      { title: "Simple", to: "admin-push-notification-simple-list" },
      {
        title: "Styled",
        to: { name: "admin-push-notification-styled" },
      },
    ],
  },
  // {
  //   title: "Templates",
  //   icon: { icon: "tabler-template" },
  //   children: [
  //     { title: "List", to: "admin-templates-list" },
  //     { title: "Add", to: "admin-templates-add" },
  //   ],
  // },
];
