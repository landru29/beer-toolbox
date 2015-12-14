describe('Unit conversion service', function () {
    var UnitsConversion;


    beforeEach(module('BeerToolbox'));

    beforeEach(inject(function (_UnitsConversion_) {
        UnitsConversion = _UnitsConversion_;
    }));

    it('Should convert mass', function () {
        expect(
            UnitsConversion.fromTo(10, 'mass.kg', 'mass.g')
        ).toEqual(10000, 'Kg -> g');
        expect(
            UnitsConversion.fromTo(10, 'mass.t', 'mass.kg')
        ).toEqual(10000, 'T -> Kg');
        expect(
            UnitsConversion.fromTo(10, 'mass.t', 'mass.kg')
        ).toEqual(10000, 'g -> mg');
    });
    
    
     it('Should convert volumes', function () {
        expect(
            UnitsConversion.fromTo(10, 'volume.ml', 'volume.l')
        ).toEqual(0.01, 'ml -> L');
        expect(
            UnitsConversion.fromTo(10, 'volume.l', 'volume.dm3')
        ).toEqual(10, 'L -> dm3');
        expect(
            UnitsConversion.fromTo(10, 'volume.l', 'volume.m3')
        ).toEqual(0.01, 'L -> m3');
        
    });
    
    it('Should convert temperatures', function () {
        expect(
            UnitsConversion.fromTo(10, 'temperature.celcius', 'temperature.fahrenheit', {precision:2})
        ).toEqual(50, 'celcius -> fahrenheit');
        expect(
            UnitsConversion.fromTo(10, 'temperature.kelvin', 'temperature.fahrenheit', {precision:2})
        ).toEqual(-441.67, 'kelvin -> fahrenheit');
    });
    
    
    it('Should convert sugars', function () {
        expect(
            UnitsConversion.fromTo(1.035, 'sugar.sg', 'sugar.plato', {precision:2})
        ).toEqual(8.78, 'Sg -> plato');
        expect(
            UnitsConversion.fromTo(35, 'sugar.plato', 'sugar.brix', {precision:2})
        ).toEqual(35.06, 'plato -> brix');
    });
    
    it('Should retrieve unit', function () {
		var unit = UnitsConversion.getPhysicalUnits('mass.g');
        expect(unit.type).toBeDefined();
        var units = UnitsConversion.getPhysicalUnits();
        for (var type in units) {
			expect(units[type].type).toBeDefined();
		}
    });

});
