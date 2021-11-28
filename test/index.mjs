import { expect } from 'chai';
import { lineMP } from './../lineMP.mjs';

describe('PARTE I- Implementação do algoritmo do ponto médio', () => {
	it('Testa lineMP - 4 passos', () => {
		const result = lineMP(
			{ x: 0, y: 0 },
			{ x: 3, y: 1 }
		);
		const expected = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }];

		expect(result).to.deep.equal(expected);
	});
	it('Testa lineMP - 5 passos', () => {
		const result = lineMP(
			{ x: 0, y: 0 },
			{ x: 4, y: 1 }
		);
		const expected = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 1 }];

		expect(result).to.deep.equal(expected);
	});
});
