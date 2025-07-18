import React from 'react';
import { ScrollView } from 'react-native';
import ProductCard from './ProductCard';

const ProductListHorizontal = ({ products }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 16 }}>
    {products.map((product, idx) => (
      <ProductCard key={idx} {...product} />
    ))}
  </ScrollView>
);

export default ProductListHorizontal;