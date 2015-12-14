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

angular.module('BeerToolbox', []);
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
 * @name BeerToolbox.Polynome
 * @module BeerToolbox
 * @description
 *  Perform basic operations on a polynome, including solve
 */
angular.module('BeerToolbox').service('Polynome', function(){
    'use strict';
    
    /**
     * @ngdoc method
     * @constructor
     * @name Polynome
     * @methodOf BeerToolbox.Polynome
     * @module BeerToolbox
     * @description
     * Constructor
     * @param {Object} polynomeObj Polynome; ie <pre>
     * {
     *     a0 : 1, 
     *     a1 : 5, 
     *     a2 : 6, 
     *     a3 : 9
     * }</pre>
     **/
    var Polynome = function(polynomeObj) {
        var self = this;
        this.polynomeObj = {};
        var degrees = [0];
        Object.keys(polynomeObj).forEach(function(key) {
            var matcher = key.match(/[a-zA-Z_\.\-]*(\d+)/);
            if (matcher) {
                var degree = parseInt(matcher[1], 10);
                degrees.push(degree);
                self.polynomeObj[degree] = parseFloat(polynomeObj[key]);
            }
        });
        this.size = Math.max.apply(null, degrees) + 1;
    };
    
    /**
     * @ngdoc method
     * @name solveEq
     * @methodOf BeerToolbox.Polynome
     * @module BeerToolbox
     * @description
     * Solve a polynome equation a3.x^3 + a2.x^2 + a1.x + a0 = value
     * @param {Object} polynomeObj Polynome; ie <pre>
     * {
     *     a0 : 1, 
     *     a1 : 5, 
     *     a2 : 6, 
     *     a3 : 9
     * }</pre>
     * @param  {Float} value       Value in the equation a3.x^3 + a2.x^2 + a1.x + a0 = value
     * 
     * @return {Array} Set of solutions
     **/
    Polynome.prototype.solveEq = function(value) {
        switch (this.size) {
            case 1:
                return [];
            case 2:
                return firstDegree(this.polynomeObj, value);
            case 3:
                return secondDegree(this.polynomeObj, value);
            case 4:
                return thirdDegree(this.polynomeObj, value);
            default:
                return [];
        }
    };
    
    /**
     * @ngdoc method
     * @name invert
     * @methodOf BeerToolbox.Polynome
     * @module BeerToolbox
     * @description
     * Solve the polynome
     * @param   {Integer|float} value Value to pass to the polynome
     * @returns {Float} Solution
     */
    Polynome.prototype.invert = function(value){
        var result = this.solveEq(value);
        return result.length ? result[0] : null;
    };
    
    /**
     * @ngdoc method
     * @name direct
     * @methodOf BeerToolbox.Polynome
     * @module BeerToolbox
     * @description 
     * Inject th value in the polynome 
     * @param   {Integer|float} value Value to pass to the polynome
     * @returns {float} Solution
     */
    Polynome.prototype.direct = function(value) {
        var self = this;
        var result = 0;
        Object.keys(this.polynomeObj).forEach(function(degree) {
            result += self.polynomeObj[degree] * Math.pow(value, degree);
        });
        return result;
    };
    
    /**
     * Solve a first degree polynome
     * 
     * @param {Object} polynomeObj Polynome; ie {a0: 1, a1:5}
     * @param  {Float} value       Value in the equation a1.x + a0 = value
     * 
     * @return {Array}
     **/ 
    var firstDegree = function(polynomeObj, value) {
        if (polynomeObj[1]) {
            return [(value - (polynomeObj[0] ? polynomeObj[0] : 0)) / polynomeObj[1]];
        } else {
            return [];
        }
    };
    
    /**
     * Solve a second degree polynome
     * 
     * @param {Object} polynomeObj Polynome; ie {a0: 1, a1:5, a2:6}
     * @param  {Float} value       Value in the equation a2.x^2 + a1.x + a0 = value
     * 
     * @return {Array}
     **/ 
    var secondDegree = function(polynomeObj, value) {
        var delta = Math.pow(polynomeObj[1], 2) - 4 *(polynomeObj[0] - value) * polynomeObj[2];
        if (delta<0) {
            return [];
        }
        if (delta === 0) {
            return [-polynomeObj[1]/(2*polynomeObj[2])];
        }
        if (delta > 0) {
            return [
                (-polynomeObj[1] + Math.sqrt(delta)) / (2 * polynomeObj[2]),
                (-polynomeObj[1] - Math.sqrt(delta)) / (2 * polynomeObj[2])
            ];
        }
    };

    /**
     * Solve a third degree polynome
     * 
     * @param {Object} polynomeObj Polynome; ie {a0: 1, a1:5, a2:6, a3:9}
     * @param  {Float} value       Value in the equation a3.x^3 + a2.x^2 + a1.x + a0 = value
     * 
     * @return {Array}
     **/ 
    var thirdDegree = function(polynomeObj, value) {
        if (polynomeObj[3] !== 0) {
            if ((polynomeObj[1] === 0) && (polynomeObj[2] === 0)) {
                sol[0] = 1;
                return [-Math.pow((polynomeObj[0] - value) / polynomeObj[3],1/3)];
            } else {
                var a0 = (polynomeObj[0] - value) / polynomeObj[3];
                var a1 = polynomeObj[1] / polynomeObj[3];
                var a2 = polynomeObj[2] / polynomeObj[3];
                var a3 = a2 / 3;
                var p = a1 - a3 * a2;
                var q = a0 - a1 * a3 + 2 * Math.pow(a3, 3);
                var delta = Math.pow(q / 2, 2) + Math.pow(p / 3, 3);
                if (delta > 0) {
                    var w= Math.pow(-q / 2 + Math.sqrt(delta),1/3);
                    return [w - p / (3 * w) - a3];
                }
                if (delta === 0) {
                    return [
                        3 * q / p - a3,
                        -3 * q / (2 * p) - a3,
                        -3 * q / (2 * p) - a3
                    ];
                }
                if (delta < 0) {
                    var u= 2 * Math.sqrt(-p / 3);
                    var v= -q / (2 * Math.pow(-p / 3, 3 / 2));
                    var t= Math.acos(v) / 3;
                    return [
                        u * Math.cos(t) - a3,
                        u * Math.cos(t + 2 * Math.PI / 3) - a3,
                        u * Math.cos(t + 4 * Math.PI / 3) - a3
                    ];
                }
            }
        } else {
            return secondDegree(equ, value);
        }
    };
    
    return Polynome;
});
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
 * @name BeerToolbox.UnitsConversion
 * @module BeerToolbox
 * @description
 *  Units conversions
 */
angular.module('BeerToolbox').service('UnitsConversion',
    ['Polynome', function (Polynome) {
        'use strict';
    
        var unitDecoder = /(([\w-]*)\.)?(.*)/;

        this.data = {
            temperature: {
                celcius: new Polynome({ // kelvin -> celcius
                    a0: -273.15,
                    a1: 1
                }),
                fahrenheit: new Polynome({ // kelvin -> fahrenheit
                    a0: -459.67,
                    a1: 9 / 5
                }),
                kelvin: new Polynome({ // kelvin -> kelvin
                    a1: 1
                })
            },
            color: {
                ebc: new Polynome({
                    a1: 1
                }),
                srm: new Polynome({
                    a1: 1 / 1.97
                }),
                lovibond: new Polynome({
                    a0: 0.561051,
                    a1: 0.374734
                }),
                mcu: {
                    direct: function (ebc) {
                        if (ebc / 1.97 >= 10) {
                            return (ebc / 1.97 - (50 / 7)) * 3.5;
                        } else {
                            return 10 - Math.sqrt(100.0 - ebc * 5.0761421);
                        }
                    },
                    invert: function (mcu) {
                        if (mcu >= 10) {
                            return 3.94 * (mcu + 25) / 7;
                        } else {
                            return (100 - Math.pow(10 - mcu, 2)) / 5.0761421;
                        }
                    }
                },
                rgb: {
                    direct: function (ebc) {
                        var toHex = function (i) {
                            var s = '00' + i.toString(16);
                            return s.substring(s.length - 2);
                        };
                        var r = Math.round(Math.min(255, Math.max(0, 255 * Math.pow(0.975, ebc / 1.97))));
                        var g = Math.round(Math.min(255, Math.max(0, 245 * Math.pow(0.88, ebc / 1.97))));
                        var b = Math.round(Math.min(255, Math.max(0, 220 * Math.pow(0.7, ebc / 1.97))));
                        return '#' + toHex(r) + toHex(g) + toHex(b);
                    },
                    invert: function (rgb) {
                        /*var color = rgb.match(/#(.{2})(.{2})(.{2})/);
                        if (color.length === 4) {
                            var r = parseInt(color[1], 16);
                            var g = parseInt(color[1], 16);
                            var b = parseInt(color[1], 16);
                        }*/
                        return 0;
                    }
                }
            },
            sugar: {
                plato: new Polynome({ // sg -> plato
                    a3: 135.997,
                    a2: -630.272,
                    a1: 1111.14,
                    a0: -616.868
                }),
                brix: new Polynome({ // sg -> brix
                    a3: 182.4601,
                    a2: -775.6821,
                    a1: 1262.7794,
                    a0: -669.5622
                }),
                alcohol: new Polynome({ // sg -> alcohol
                    a1: 1 / 0.76,
                    a0: -1 / 0.76
                }),
                sg: new Polynome({ // sg -> sg
                    a1: 1
                }),
                gPerLiter: new Polynome({ // sg -> grams per liter
                    a3: 1824.601,
                    a2: -7756.821,
                    a1: 12627.794,
                    a0: -6695.622
                })
            },
            mass: {
                kg: new Polynome({ // kg->kg
                    a1: 1
                }),
                g: new Polynome({ // kg->g
                    a1: 1000
                }),
                t: new Polynome({ // kg->T
                    a1: 0.001
                }),
                mg: new Polynome({ // kg->mg
                    a1: 1000000
                })
            },
            volume: {
                l: new Polynome({ // L -> L
                    a1: 1
                }),
                ml: new Polynome({ // L -> ml
                    a1: 1000
                }),
                dl: new Polynome({ // L -> dl
                    a1: 10
                }),
                cl: new Polynome({ // L -> cl
                    a1: 100
                }),
                'dm3': new Polynome({ // L -> dm3
                    a1: 1
                }),
                'm3': new Polynome({ // L -> m3
                    a1: 0.001
                }),
                'cm3': new Polynome({ // L -> cm3
                    a1: 1000
                }),
                'mm3': new Polynome({ // L -> mm3
                    a1: 1000000
                }),
                'gal-us': new Polynome({ // L -> gal-us
                    a1: 0.220
                }),
                'gal-en': new Polynome({ // L -> gal-en
                    a1: 0.264
                }),
                pinte: new Polynome({ // L -> pinte
                    a1: 1.760
                }),
            }
        };

        /**
         * @ngdoc method
         * @name fromTo
         * @methodOf BeerToolbox.UnitsConversion
         * @module BeerToolbox
         * @description
         * Convert units
         * 
         * @param   {Float} value   Value to convert
         * @param  {String} from    Current unit (type.unit)
         * @param  {String} to      Destination unit (type.unit)
         * @param {Object=} options Options (type, precision)
         * 
         * @return {Float} Converted value
         **/ 
        this.fromTo = function (value, from, to, options) {
            var UnitException = function (origin, message) {
                this.origin = origin;
                this.message = message;
            };
            
            var decodeFrom = from.match(unitDecoder);
            var decodeTo = to.match(unitDecoder);
            var unitTo = decodeTo[3];
            var unitFrom = decodeFrom[3];
            
            value = ('string' === typeof value) ? parseFloat(value) : value;

            options = angular.extend(
                {
                    type: decodeFrom[2],
                    precision: null
                }, 
                options
            );

            if (!this.data[options.type]) {
                throw new UnitException('from', 'Type ' + options.type + ' does not exist in the unit conversion system');
            }
            if (!this.data[options.type][unitFrom]) {
                throw new UnitException('from', 'Unit ' + unitFrom + ' does not exist for type ' + options.type);
            }
            if (!this.data[options.type][unitTo]) {
                throw new UnitException('to', 'Unit ' + unitTo + ' does not exist for type ' + options.type);
            }
            var siValue = this.data[options.type][unitFrom].invert(value);
            if ('number' !== typeof siValue) {
                throw new UnitException('from', 'Value ' + value + ' is out of bounce in unit ' + unitFrom + ', type ' + options.type);
            }
            var result = this.data[options.type][unitTo].direct(siValue);
            if ((options.precision) && ('number' === typeof result)) {
                var dec = Math.pow(10, options.precision);
                return Math.round(result * dec) / dec;
            } else {
                return result;
            }
        };

        /**
         * @ngdoc method
         * @name getPhysicalUnits
         * @methodOf BeerToolbox.UnitsConversion
         * @module BeerToolbox
         * @param  {String=} type  Optional unitType (ie 'mass.g')
         * @description
         * Get the list of available units
         * 
         * @return {Array|Object} Units description array, or the found type
         **/
        this.getPhysicalUnits = function (unitType) {
            var self = this;
            if (!unitType) {
				return Object.keys(this.data).map(function(type) {
					return {
						type: type,
						units: Object.keys(self.data[type]).map(function(unit) {
							return {
								name: unit,
								type: type + '.' + unit
							};
						})
					};
				});
			} else {
				var result;
				Object.keys(this.data).forEach(function(type) {
					Object.keys(self.data[type]).forEach(function(unit) {
						if (unitType === type + '.' + unit) {
							result = {
								name: unit,
								type: type + '.' + unit
							};
						}
					});
				});
				return result;
			}
        };
    
        /**
         * @ngdoc method
         * @name registerConversion
         * @methodOf BeerToolbox.UnitsConversion
         * @module BeerToolbox
         * @description
         * Register a new convertion
         * @param   {Object} polynomeCoef Polynome coeficients
         * @param   {String} unit         Unit (type.unit | unit)
         * @param  {String=} type         Unit type (if not specified in unit)
         **/
        this.registerConversion = function (polynomeCoef, unit, type) {
            var decode = unit.match(unitDecoder);
            if (decode) {
                var thisUnitTo = decode[3];
                type = !type ? decode[2] : type;
                this.prototype.data[type] = angular.extend({}, this.prototype.data[type]);
                this.prototype.data[type][thisUnit] = new Polynome(polynomeCoef);
            }
        };

    }]);
