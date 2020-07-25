import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const itens = await AsyncStorage.getItem(
        '@GoMarket:cartItens'
      );

      if (itens){
        setProducts([...JSON.parse(itens)])
      }  
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async (product: Product) => {
      const hasProduct = products.find( p => p.id === product.id);
      
      if (hasProduct){
        setProducts( products.map( p => 
          p.id === product.id ? {...product, quantity: p.quantity + 1}
                              : p,
        ));
      } else {
        setProducts([...products, {...product, quantity: 1}]);
      }

      saveItensAsyncStorage(); 
  }, [products]);

  const increment = useCallback(async id => {
    setProducts( products.map( p => p.id === id ? {...p, quantity: p.quantity + 1}: p));

    saveItensAsyncStorage();
  }, [products]);

  const decrement = useCallback(async id => {
    const decreItem = products.find( p => p.id === id);
    if(decreItem !== undefined && decreItem?.quantity > 1){
      setProducts( products.map( p => p.id === id ? {...p, quantity: p.quantity - 1 } : p))
    } else {
      const listWithoutDecreItem = products.filter( p => p.id !== id);
      setProducts(listWithoutDecreItem);
    }
    saveItensAsyncStorage(); 
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  async function saveItensAsyncStorage(){
      await AsyncStorage.setItem(
        '@GoMarket:cartItens', JSON.stringify(products)
      );
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
