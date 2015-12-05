describe('Polynome service', function () {
    var Polynome;

    var fixtures = {
        firstDegree: {
            a1: 10
        },
        secondDegree: {
            a1: -3,
            a0: 2,
            a2: 1
        },
        thirdDegree: {
            a1: 11,
            a3: 1,
            a0: -6,
            a2: -6
        },
    };

    beforeEach(module('BeerToolbox'));

    beforeEach(inject(function (_Polynome_) {
        Polynome = _Polynome_;
    }));

    it('Should build a first degree polynome', function () {
        var poly = new Polynome(fixtures.firstDegree);
        expect(poly.size).toEqual(2);
    });

    it('Should build a second degree polynome', function () {
        var poly = new Polynome(fixtures.secondDegree);
        expect(poly.size).toEqual(3);
    });

    it('Should build a third degree polynome', function () {
        var poly = new Polynome(fixtures.thirdDegree);
        expect(poly.size).toEqual(4);
    });

    it('Sould solve a first degree', function () {
        var poly = new Polynome(fixtures.firstDegree);
        var direct = poly.direct(5);
        var solve = poly.invert(1);
        expect(direct).toEqual(50);
        expect(solve).toEqual(0.1);
    });

    it('Sould solve a second degree', function () {
        var poly = new Polynome(fixtures.secondDegree);
        var direct = poly.direct(5);
        var solve = poly.invert(0);
        expect(direct).toEqual(12);
        expect(solve).toEqual(2);
    });

    it('Sould solve a third degree', function () {
        var poly = new Polynome(fixtures.thirdDegree);
        var direct = poly.direct(5);
        var solve = poly.invert(0);
        expect(direct).toEqual(24);
        expect(solve).toEqual(3);
    });
});