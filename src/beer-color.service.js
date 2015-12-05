/** 
 * @ngdoc service
 * @name BeerToolbox.BeerColor
 * @module BeerToolbox
 * @description
 *  Units conversions
 */
angular.module('BeerToolbox').service('BeerColor',
    function (UnitsConversion) {
        'use strict';
    
    /**
     * @ngdoc method
     * @name estimateColor
     * @methodOf BeerToolbox.BeerColor
     * @module BeerToolbox
     * @description
     * Compute the corrected density
     * 
     * @param {Float} liquideVol Volume of liquid
     * @param {Array} grains     list of grains <pre>
     * {
     *    massGr: 500, //mass in grams 
     *    color: 50, //EBC color
     * }</pre>
     * 
     * @return {Object} color of the beer
     **/ 
    Recipe.prototype.estimateColor = function (liquideVol, grains) {
        var mcu = 0;
        var lovi;
        grains.forEach(function(grain){
            lovi = UnitsConversion.fromTo(grain.color, 'color.ebc', 'color.lovibond');
            mcu += 8.34540445202 * lovi * grain.massGr / liquideVol;
        });
        var srm = 1.4922 * Math.pow(mcu, 0.6859);
        return {
            srm: srm,
            rgb: unitsConversionProvider.fromTo(srm, 'color.srm', 'color.rgb')
        };
    };
});