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

angular.module('BeerToolbox', ['UnitsConversion']);

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
    ['UnitsConversion', function (UnitsConversion) {
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
}]);

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
 * @name BeerToolbox.BeerSugar
 * @module BeerToolbox
 * @description
 *  Compute Sugars
 */
angular.module('BeerToolbox').service('BeerSugar', ['Polynome', function(Polynome){
    var sg_to_brix = new Polynome({
        a3: 182.4601,
        a2: -775.6821,
        a1: 1262.7794,
        a0: -669.5622
    });

    var sg_to_plato = new Polynome({
        a3: 135.997,
        a2: -630.272,
        a1: 1111.14,
        a0: -616.868
    });

    /**
     * @ngdoc method
     * @name densityCorrection
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Compute the corrected density
     *
     * @param {Float} measuredGravity measured specific gravity
     * @param {Float} measuredTemp    temperature in celcius during measurement
     * @param {Float} calibrationTemp calibration temperature of the instrument (default 20)
     *
     * @return {Float} Specific gravity
     **/
    this.densityCorrection = function(measuredGravity, measuredTemp, calibrationTemp) {
        calibrationTemp = ('undefined' === typeof calibrationTemp) ? 20 : calibrationTemp;
        return (measuredGravity - (calibrationTemp + 288.9414) / (508929.2 * (calibrationTemp + 68.12963)) * Math.pow(calibrationTemp - 3.9863, 2)) / (1 - (measuredTemp + 288.9414) / (508929.2 * (measuredTemp + 68.12963)) * Math.pow(measuredTemp - 3.9863, 2));
    };

    /**
     * @ngdoc method
     * @name gravityToAlcohol
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Compute the alcohol in percentage volume
     *
     * @param {Float} initialGravity  gravity before fermentation
     * @param {Float} finalGravity    gravity after fermentation
     * @param {Float} additionalSugar quantity, in kg, of sugar added (default 0)
     *
     * @return {Float} Alcohol rate
     **/
    this.gravityToAlcohol = function(initialGravity, finalGravity, additionalSugar) {
        calibrationTemp = calibrationTemp ? calibrationTemp : 0;
        return ((((initialGravity - finalGravity) * 1.05) / finalGravity) * 100) / 0.795 + ((additionalSugar * 0.0005) / 0.795) / 10;
    };

    /**
     * @ngdoc method
     * @name gravityDilution
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Compute the gravity after dilution or evaporation
     *
     * @param {Float} initialVolume     Volume before dilution in liter
     * @param {Float} gravity           Specific gravity of the initial volume
     * @param {Float} additionalVolume  Volume of liquide to add (if negative, evaporation) in liter
     * @param {Float} additionalGravity Specific gravity of the additional volume (default 1)
     *
     * @return {Float} Specific gravity
     **/
    this.gravityDilution = function(initialVolume, gravity, additionalVolume, additionalGravity) {
        additionalGravity = (('undefined' === typeof additionalGravity) || (additionalVolume<0)) ? 1 : additionalGravity;
        var finalVolume = initialVolume + additionalVolume;
        return (gravity * initialVolume +  additionalGravity * additionalVolume) / finalVolume;
    };

    /**
     * @ngdoc method
     * @name mashingVolume
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Compute the volume of water to add to the malt
     *
     * @param {Float} grainMass quantity of malt in kg
     * @param {Float} ratio     mashing ratio (default 3)
     *
     * @return {Float} Volume of water
     **/
    this.mashingVolume = function(grainMass, ratio) {
        return (('undefined' === typeof ratio) ? 3 : ratio) * grainMass;
    };

    /**
     * @ngdoc method
     * @name grainRetention
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Compute the volume of water lost in the grain
     *
     * @param {Float} grainMass quantity of malt in kg
     * @param {Float} ratio     retention ratio (default 1)
     *
     * @return {Float} Volume of water
     **/
    this.grainRetention = function(grainMass, ratio) {
        return (('undefined' === typeof ratio) ? 1 : ratio) * grainMass;
    };

    /**
     * @ngdoc method
     * @name volumeToBoil
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Compute the volume to boil to reach a final expected volume
     *
     * @param {Float} finalVolume       expected volume at the end of the operation (in liter)
     * @param {Float} ratioLossBoiling  loss ratio during boiling operation (default 10%)
     * @param {Float} rationLossCooling loss ration during cooling operation (default 5%)
     *
     * @return {Float} Liquid volume
     **/
    this.volumeToBoil = function(finalVolume, ratioLossBoiling, rationLossCooling)
    {
        ratioLossBoiling = ('undefined' === typeof ratioLossBoiling) ? 0.1 : ratioLossBoiling;
        rationLossCooling = ('undefined' === typeof rationLossCooling) ? 0.05 : rationLossCooling;
        return finalVolume / ((1-ratioLossBoiling) * (1-rationLossCooling));
    };

    /**
     * @ngdoc method
     * @name producesSugar
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Compute the quantity of sugar produces from the malts
     *
     * @param {Array} malts Set of malts<pre>
     *     [{
     *         mass: 1,    // in kilo
     *         yield_m:0.78  // between 0 and 1
     *       }]</pre>
     * @param {Float} globalEfficiency global efficiency of the extraction (default 0.75)
     *
     * @return {Float} Sugar mass
     **/
    this.producedSugar = function(malts, globalEfficiency) {
        globalEfficiency = ('undefined' === typeof globalEfficiency)  ? 0.75 : globalEfficiency;
        return globalEfficiency * ([0].concat(malts)).reduce(function(total, malt) {
            return total + malt.mass * malt.yield / 100;
        });
    };

    /**
     * @ngdoc method
     * @name brixToSg
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Convert Brix gravity to specific gravity
     *
     * @param {Float} brix gravity (for 10%, enter 10)
     *
     * @return {Float} Specific gravity
     **/
    this.brixToSg = function(brix) {
        return sg_to_brix.invert(brix);
    };


    /**
     * @ngdoc method
     * @name sgToBrix
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Convert specific gravity to brix gravity
     *
     * @param {Float} sg specific gravity
     *
     * @return {Float} Brix gravity
     **/
    this.sgToBrix = function(sg) {
        return sg_to_brix.direct(brix);
    };

    /**
     * @ngdoc method
     * @name platoToSg
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Convert plato gravity to specific gravity
     *
     * @param {Float} plato gravity (for 10%, enter 10)
     *
     * @return {Float} Specific gravity
     **/
    this.platoToSg = function(plato) {
        return sg_to_plato.invert(plato);
    };

    /**
     * @ngdoc method
     * @name sgToPlato
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Convert specific gravity to brix gravity
     *
     * @param {Float} sg specific gravity
     *
     * @return {Float} Plato gravity
     **/
    this.sgToPlato = function(plato) {
        return sg_to_plato.direct(plato);
    };

    /**
     * @ngdoc method
     * @name sgToAlcohol
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Convert specific gravity to alcohol rate
     *
     * @param {Float} sg specific gravity
     *
     * @return {Float} Alcohol rate
     **/
    this.sgToAlcohol = function(sg) {
        return alcohol / 0.0076;
    };


    /**
     * @ngdoc method
     * @name alcoholToSg
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Convert alcohol to specific gravity
     *
     * @param {Float} alcohol rate (10 for 10%)
     *
     * @return {Float} Specific gravity
     **/
    this.alcoholToSg = function(alcohol) {
        return 0.0076 * alcohol;
    };

    /**
     * @ngdoc method
     * @name sgToAlcohol
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Convert specific gravity to alcohol rate
     *
     * @param {Float} initialSg initial specific gravity
     * @param {Float} finalSg   specific gravity after fermentation (default: attenuation 25%)
     *
     * @return {Float} Alcohol rate
     **/
    this.sgToAlcohol = function(initialSg, finalSg) {
        if ('undefined' === typeof finalSg) {
            finalSg = 1 + (initialSg - 1) / 4;
        }
        return (initialSg - finalSg) / 0.0076;
    };

    /**
     * @ngdoc method
     * @name diluateSugar
     * @methodOf BeerToolbox.BeerSugar
     * @module BeerToolbox
     * @description
     * Compute the densities as a result of the dilution of sugar un a volume of liquide
     *
     * @param {Float} volume       volume of the liquide in liter
     * @param {Float} sugar        the amount of sugar in kilo
     * @param {Float} residualRate residual sugar rate; ie. if 0.25, with initial gravity 1.080,
     *                           the final gravity will be 1.020
     *
     * @return {Object} Densities
     **/
    this.diluateSugar = function(volume, sugar, residualRate) {
        residualRate = ('undefined' === typeof residualRate) ? 0.25 : residualRate;
        var brix     = (volume !==0) ? 100 * sugar / volume : 0;
        var sg       = brixToSg(brix);
        var finalSg  = 1 + (sg - 1) * residualRate;
        var alcohol  = sgToAlcohol(sg, finalSg);
        var plato    = sgToPlato(sg);
        return {
            brixGravity: brix,
            specificGravity: sg,
            residualGravity: finalSg,
            platoGravity: plato,
            alcohol: alcohol
        };
    };

}]);

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
 * @name BeerToolbox.Ibu
 * @module BeerToolbox
 * @description
 *  Units conversions
 */
angular.module('BeerToolbox').service('Ibu',
    function () {
        'use strict';



        var ibuComputeMethods = {
            rager: function (alphaAcidity, massGr, volumeL, gravitySg, lastingMin) {
                var ga = (gravitySg > 1.050 ? (gravitySg - 1.050) / 0.2 : 0);
                var utilization = 18.109069 + 13.862039 * Math.tanh((lastingMin - 31.322749) / 18.267743);
                return massGr * utilization * alphaAcidity * 1000 / (volumeL * (1 + ga));
            },
            /*garetz: function (alphaAcidity, massGr, volumeL, gravitySg, lastingMin) {
                var finalVolume = volumeL;
                var CF = finalVolume / volumeL;
                var BG = (CF * (gravitySg - 1)) + 1;
                var GF = 1 + (BG - 1.050) / 0.2;
            },*/
            tinseth: function (alphaAcidity, massGr, volumeL, gravitySg, lastingMin) {
                var bignessFactor = 1.65 * Math.pow(0.000125, gravitySg - 1);
                var boilTimeFactor = (1 - Math.exp(-0.04 * lastingMin)) / 4.15;
                var utilization = bignessFactor * boilTimeFactor;
                return massGr * utilization * alphaAcidity * 1000 / volumeL;
            }
        };

        /**
         * @ngdoc method
         * @name availableMethods
         * @methodOf BeerToolbox.Ibu
         * @module BeerToolbox
         * @description
         * List of methods to compute IBU
         * @returns {Array} List of methods to compute IBU
         **/
        this.availableMethods = function () {
            return Object.keys(ibuComputeMethods);
        };


        /**
         * @ngdoc method
         * @name compute
         * @methodOf BeerToolbox.Ibu
         * @module BeerToolbox
         * @description
         * Compute IBU
         * 
         * @param  {String} method  Computing method
         * @param   {Array} data    Beer data <pre>
         * {
         *     alphaAcidity: 4, // alpha acidity of the hop in percent
         *     type: 'pellets', // 'pellets' | 'flowers'
         *     massGr: 50,      // mass of the hop in grams
         *     volumeL: 30,     // volume of liquid in liter
         *     gravitySg: 1.05, // specific gravity of the liquid in Sg
         *     lastingMin: 60   // time during which the hops is in the boiling liquide
         * }</pre>
         * @param  {Object=} options Options <pre>
         * {
         *     precision: 2, // 2 decimals
         * }</pre>
         * 
         * @returns {Float} Ibu
         **/
        this.compute = function (method, data, options) {
            options = angular.extend(
                {
                    precision: null
                }, 
                options
            );
            var result = [0].concat(data).reduce(function (total, next) {
                var correction = /^pellet/.test(next.type ? next.type : '') ? 1.1 : 1;
                return total + ibuComputeMethods[method](correction * next.alphaAcidity / 100, next.massGr, next.volumeL, next.gravitySg, next.lastingMin);
            });
            if ((options.precision) && ('number' === typeof result)) {
                var dec = Math.pow(10, options.precision);
                return Math.round(result * dec) / dec;
            } else {
                return result;
            }
        };
    });