export const simpleProducts = ['wedding', 'birthday', 'visiting', 'membership', 'gift', 'playing'].map(type => ({
  type,
  name: type[0].toUpperCase() + type.slice(1),
  product: `${type[0].toUpperCase() + type.slice(1)}Card`
}));
