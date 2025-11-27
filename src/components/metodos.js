

export function lagrange(puntos, n, x) {
  let suma = 0;

  for (let i = 0; i <= n; i++) {
    suma += multiplicatoria(i, puntos, n, x) * puntos[i][1];
  }

  return suma;
}

function multiplicatoria(i, puntos, n, x) {
  let producto = 1;

  for (let j = 0; j <= n; j++) {
    if (j !== i) {
      producto *= (x - puntos[j][0]) / (puntos[i][0] - puntos[j][0]);
    }
  }

  return producto;
}
