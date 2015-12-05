describe('Ibu service', function () {
    var Ibu;

    beforeEach(module('BeerToolbox'));

    beforeEach(inject(function (_Ibu_) {
        Ibu = _Ibu_;
    }));

    it('Estimate IBU', function () {
        var ibu = Ibu.compute('tinseth', [
            {
                alphaAcidity: 11,
                type: 'pellets',
                massGr: 50,
                volumeL: 30,
                gravitySg: 1.05,
                lastingMin: 60
            },
             {
                alphaAcidity: 4,
                type: 'pellets',
                massGr: 40,
                volumeL: 30,
                gravitySg: 1.05,
                lastingMin: 10
            }
        ],
        {
            precision: 2
        }
        );
        expect(ibu).toEqual(51.42, 'Should estimate IBU');

    });
});