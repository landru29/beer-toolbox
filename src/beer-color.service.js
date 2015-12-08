/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 landru29
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 **/


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
    this.estimateColor = function (liquideVol, grains) {
        var mcu = 0;
        var lovi;
        grains.forEach(function(grain){
            lovi = UnitsConversion.fromTo(grain.color, 'color.ebc', 'color.lovibond');
            mcu += 8.34540445202 * lovi * (grain.mass) / liquideVol;
        });
        var srm = 1.4922 * Math.pow(mcu, 0.6859);
        var rgb = UnitsConversion.fromTo(srm, 'color.srm', 'color.rgb');
        return {
            srm: srm,
            rgb: rgb
        };
    };
});
