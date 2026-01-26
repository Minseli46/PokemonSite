test('pokeAPIService should return data', async () => {
	const data = await pokeAPIService.getData();
	expect(data).toBeDefined();
	expect(data).toHaveProperty('results');
});