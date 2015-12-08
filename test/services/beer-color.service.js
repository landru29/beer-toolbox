describe('Beer color service', function () {
    var BeerColorService;

    beforeEach(module('BeerToolbox'));

    beforeEach(inject(function (_BeerColor_) {
        BeerColorService = _BeerColor_;
    }));

    it('Convert colors', function () {
        var color = BeerColorService.estimateColor(
            40, [
                {
                    mass: 8,
                    color: 50
                }
            ]
        );
        expect(color.rgb).toEqual('#a91f01');
        expect(Math.round(color.srm * 100) / 100).toEqual(16.15);
    });
});
