import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "@/components/ui/provider" // this is provided by chakra-ui, was setup in tsconfig.app.json and vite.config.ts
import { Container } from '@chakra-ui/react';

import { Amplify } from 'aws-amplify';
import awsmobile from './aws-exports.ts';


Amplify.configure(awsmobile)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <Container fluid maxW="container.2xl" px={10}>
        <App />
      </Container>
    </Provider>
  </React.StrictMode>,
)
