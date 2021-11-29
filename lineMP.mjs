function line(x0, y0, x1, y1) {
	const dx = Math.abs(x1 - x0); // distancia em x
	const dy = Math.abs(y1 - y0); // distancia em y
	const sx = (x0 < x1) ? 1 : -1; // verifica x crescente ou decrescente
	const sy = (y0 < y1) ? 1 : -1; // verifica y crescente ou decrescente
	let err = dx - dy; // parametro de decisao, x ou y

	const res = []; // array resultado

	while (true) {
	  res.push({ x: x0, y: y0 }); // coloca o ponto atual dentro do array

	  if ((x0 === x1) && (y0 === y1)) break; // ultimo ponto
	  const e2 = err * 2; // auxiliar para parametro de decisao
	  if (e2 > -dy) { err -= dy; x0 += sx; } // decisao x
	  if (e2 < dx) { err += dx; y0 += sy; } // decisao y
  }

	return res;
}

export const lineMP = (a, b) => line(a.x, a.y, b.x, b.y);
