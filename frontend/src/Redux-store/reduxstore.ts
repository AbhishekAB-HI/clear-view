import { configureStore } from "@reduxjs/toolkit";

import { accesstockenSlice } from "./Redux-slice";

export const store = configureStore({
  reducer: {
    accessTocken: accesstockenSlice,
  },
});
