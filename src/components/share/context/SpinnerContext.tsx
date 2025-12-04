import  { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';

const SpinnerContext = createContext({
    isVisible:false,
    showSpinner:()=>{},
    hideSpinner:()=>{}

});

export const useSpinner = () => useContext(SpinnerContext);

export const SpinnerProvider = ({children}: {children: ReactNode}) => {
  const [isVisible, setIsVisible] = useState(false);

  const showSpinner = () => setIsVisible(true);
  const hideSpinner = () => setIsVisible(false);

  return (
    <SpinnerContext.Provider value={{ isVisible, showSpinner, hideSpinner }}>
      {children}
    </SpinnerContext.Provider>
  );
};