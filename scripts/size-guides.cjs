/* Exact supplied chart values. Informational only; never used for variants/stock. */
module.exports = {
  hoodie: {
    category: 'HOODIES', image: 'hoodie-size-chart.jpeg', width: 1560, height: 260,
    units: 'Measurements (cm)', headers: ['SIZE', 'CHEST', 'BODY LENGTH -HPS', 'SLEEVE LENGTH'],
    rows: [
      ['XS', '48.5cm', '66cm', '60.5cm'], ['S', '53.5cm', '68cm', '63cm'],
      ['M', '58.5cm', '70cm', '65.5cm'], ['L', '63.5cm', '72cm', '68cm'],
      ['XL', '67cm', '74cm', '69cm'], ['XXL', '70.5cm', '76cm', '70cm'],
      ['3XL', '74cm', '78cm', '71cm'], ['4XL', '79cm', '83cm', '72cm'],
      ['5XL', '84cm', '88cm', '73cm'], ['Tol +/-', '2cm', '2cm', '2cm']
    ],
    notes: []
  },
  tee: {
    category: 'TEES', image: 'tee-size-chart.jpeg', width: 1065, height: 736,
    units: 'Measurements (inches)', headers: ['SIZE', 'CHEST', 'LENGTH'],
    rows: [
      ['S', '18', '27'], ['M', '20', '29'], ['L', '22', '31'], ['XL', '24', '32'],
      ['2XL', '26', '33'], ['3XL', '28', '34'], ['4XL', '30', '35.5'],
      ['5XL', '32', '36.5'], ['7XL', '36', '38']
    ],
    notes: ['BODY WIDTH: Lay garment flat 1” below the armhole flat measure the garment across the chest.',
      'BODY LENGTH: Lay garment flat. Measure from HPS (highest point of shoulder).']
  }
};
