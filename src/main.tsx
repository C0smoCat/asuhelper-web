import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EpicScreen from "./components/EpicScreen";

// @ts-ignore
import '@vkontakte/vkui/dist/vkui.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EpicScreen />
  </StrictMode>,
)

