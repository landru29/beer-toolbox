'use strict';

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
 
(function() {
    angular.module('BeerToolbox', [])
    
    .factory('polynomial', function() {
        return (function(polynomeObj) {

            // load polynomial and compute the size
            var polynomeObj = polynomeObj;
            var size=0;
            for (var i in polynomeObj) {
                size++;
            }
            
            /**
             * Solve a first degree polynome
             * 
             * @param object polynomeObj polynome; ie {a0: 1, a1:5}
             * @param float  value       value in the equation a1.x + a0 = value
             * 
             * @return array
             **/ 
            var firstDegre = function(polynomeObj, value) {
                if (polynomeObj.a1 != 0) {
                    return [(value - polynomeObj.a0) / polynomeObj.a1];
                } else {
                    return [];
                }
            };

            /**
             * Solve a second degree polynome
             * 
             * @param object polynomeObj polynome; ie {a0: 1, a1:5, a2:6}
             * @param float  value       value in the equation a2.x^2 + a1.x + a0 = value
             * 
             * @return array
             **/ 
            var secondDegre = function(polynomeObj, value) {
                var delta = Math.pow(polynomeObj.a1, 2) - 4 *(polynomeObj.a0 - value) * polynomeObj.a2;
                if (delta<0) {
                    return [];
                }
                if (delta == 0) {
                    return [-polynomeObj.a1/(2*polynomeObj.a2)];
                }
                if (delta > 0) {
                    return [
                        (-polynomeObj.a1 + Math.sqrt(delta)) / (2 * polynomeObj.a2),
                        (-polynomeObj.a1 - Math.sqrt(delta)) / (2 * polynomeObj.a2)
                    ];
                }
            };

            /**
             * Solve a third degree polynome
             * 
             * @param object polynomeObj polynome; ie {a0: 1, a1:5, a2:6, a3:9}
             * @param float  value       value in the equation a3.x^3 + a2.x^2 + a1.x + a0 = value
             * 
             * @return array
             **/ 
            var thirdDegree = function(polynomeObj, value) {
                if (polynomeObj.a3 != 0) {
                    if ((polynomeObj.a1 == 0) && (polynomeObj.a2 == 0)) {
                        sol[0] = 1;
                        return [-Math.pow((polynomeObj.a0 - value) / polynomeObj.a3,1/3)];
                    } else {
                        var a0 = (polynomeObj.a0 - value) / polynomeObj.a3;
                        var a1 = polynomeObj.a1 / polynomeObj.a3;
                        var a2 = polynomeObj.a2 / polynomeObj.a3;
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

            /**
             * Solve a polynome equation a3.x^3 + a2.x^2 + a1.x + a0 = value
             * 
             * @param object polynomeObj polynome; ie {a0: 1, a1:5, a2:6, a3:9}
             * @param float  value       value in the equation a3.x^3 + a2.x^2 + a1.x + a0 = value
             * 
             * @return array
             **/
            var solve = function(polynomeObj, value) {
                if (size == 1) {
                    return [];
                }
                if (size == 2) {
                    return firstDegree(polynomeObj, value);
                }
                if (size == 3) {
                    return secondDegree(polynomeObj, value);
                }
                if (size == 4) {
                    return thirdDegree(polynomeObj, value);
                }
                return [];
            };

            return {
                direct: function(value) {
                    var result = 0;
                    var n=0;
                    for(var n=0; n<size; n++) {
                        var coef = ('undefined' === typeof polynomeObj['a'+n]) ? 0 : polynomeObj['a'+n];
                        result += coef * Math.pow(value,n);
                    }
                    return result;
                },
                invert: function(value){
                    var result = solve(polynomeObj, value);
                    return result[0];
                }
            }
        });
    })

    .provider('beerCatalog', ['$http', function($http) {
        this.$get = function() {
            return {
                loadSources = function() {
                    var data={};
                    for (var index in this.sources) {
                        $http.get(this.source[index])
                           .then(function(res){
                              data[index] = res.data;                
                            });
                    }
                    
                }
            };
        };

        this.sources = [];

        this.addSource = function(sourceFilename) {
            this.source.push(sourceFilename);
        };

        this.getSources = function() {
            return this.sources;
        };

        this.removeSource = function(sourceFilename) {
            var index = array.indexOf(sourceFilename);
            if (index > -1) {
                array.splice(index, 1);
            }
        };
    }])
    
    .factory('beerSugar', ['polynomial', function(polynomial) {

        var sg_to_brix = new polynomial({
            a3: 182.4601,
            a2: -775.6821,
            a1: 1262.7794,
            a0: -669.5622
        });
        
        var sg_to_plato = new polynomial({
            a3: 135.997,
            a2: -630.272,
            a1: 1111.14,
            a0: -616.868
        });
        
        /**
         * Compute the corrected density
         * 
         * @param float measuredGravity measured gravity
         * @param float measuredTemp    temperature in celcius during measurement
         * @param float calibrationTemp calibration temperature of the instrument (default 20)
         * 
         * @return float
         **/ 
        var densityCorrection = function(measuredGravity, measuredTemp, calibrationTemp) {
            if ('undefined' === typeof calibrationTemp) {
                calibrationTemp = 20;
            }
            var correctionFactor = 
                (
                    (measuredGravity -
                        (calibrationTemp + 288.9414)
                        /
                        (508929.2 * (calibrationTemp + 68.12963))
                        *
                        Math.pow(calibrationTemp-3.9863, 2)
                    )
                    /
                    (1 -
                        (measuredTemp + 288.9414)
                        /
                        (508929.2*(measuredTemp+68.12963))
                        *
                        Math.pow(measuredTemp-3.9863,2)
                    )
                ) - measuredGravity;

            return correctionFactor + measuredGravity;
        };

        /**
         * Compute the alcohol in percentage volume
         * 
         * @param float initialGravity  gravity before fermentation
         * @param float finalGravity    gravity after fermentation
         * @param float additionalSugar quantity, in kg, of sugar added (default 0)
         * 
         * @return float
         **/ 
        var gravityToAlcohol = function(initialGravity, finalGravity, additionalSugar) {
            if ('undefined' === typeof additionalSugar) {
                additionalSugar = 0;
            }
            return ((((initialGravity - finalGravity) * 1.05) / finalGravity) * 100) / 0.795 
                 + ((additionalSugar * 0.0005) / 0.795) / 10;
        };

        /**
         * Compute the gravity after dilution or evaporation
         * 
         * @param float initialVolume     Volume before dilution in liter
         * @param float gravity           gravity of the initial volume
         * @param float additionalVolume  volume of liquide to add (if negative, evaporation) in liter
         * @param float additionalGravity gravity of the additional volume (default 1)
         * 
         * @return float
         **/ 
        var gravityDilution = function(initialVolume, gravity, additionalVolume, additionalGravity) {
            if (('undefined' === typeof additionalGravity) || (additionalVolume<0)) {
                additionalGravity = 1;
            }
            var finalVolume = initialVolume + additionalVolume;
            return (gravity * initialVolume +  additionalGravity * additionalVolume) / finalVolume;
        };

        /**
         * Compute the volume of water to add to the malt
         * 
         * @param float grainMass quantity of malt in kg
         * @param float ratio     mashing ratio (default 3)
         * 
         * @return float
         **/ 
        var mashingVolume = function(grainMass, ratio) {
            if ('undefined' === typeof ratio) {
                ratio = 3;
            }
            return ratio * grainMass;
        };

        /**
         * Compute the volume of water lost in the grain
         * 
         * @param float grainMass quantity of malt in kg
         * @param float ratio     retention ratio (default 1)
         * 
         * @return float
         **/ 
        var grainRetention = function(grainMass, ratio) {
            if ('undefined' === typeof ratio) {
                ratio = 1;
            }
            return ratio * grainMass;
        };

        /**
         * Compute the volume to boil to reach a final expected volume
         * 
         * @param float finalVolume       expected volume at the end of the operation (in liter)
         * @param float ratioLossBoiling  loss ratio during boiling operation (default 10%)
         * @param float rationLossCooling loss ration during cooling operation (default 5%)
         * 
         * @return float
         **/ 
        var volumeToBoil = function(finalVolume, ratioLossBoiling, rationLossCooling)
        {
            if ('undefined' === typeof ratioLossBoiling) {
                ratioLossBoiling = 0.1;
            }
            if ('undefined' === typeof rationLossCooling) {
                rationLossCooling = 0.05;
            }
            return finalVolume / ((1-ratioLossBoiling) * (1-rationLossCooling));
        };

        /**
         * Compute the quantity of sugar produces from the malts
         * 
         * @param {Array} malts           malts description 
         *     [
         *       {
         *         mass: 1,    // in kilo
         *         yield_m:0.78  // between 0 and 1
         *       }, 
         *       {
         *         mass: 2,
         *         yield_m:0.75
         *       }
         *     ]
         * @param float globalEfficiency global efficiency of the extraction (default 0.75)
         * 
         * @return float
         **/ 
        var producedSugar = function(malts, globalEfficiency) {
            globalEfficiency = ('undefined' === typeof globalEfficiency)  ? 0.75 : globalEfficiency
            var producedSugarPerMalt = function(mass, yield_m, globalEfficiency) {
                return mass * yield_m * globalEfficiency;
            };
            
            
            if (('mass' in malts) && ('yield_m' in malts)) {
                return producedSugarPerMalt(malts['mass'], malts['yield_m'], globalEfficiency);
            } else {
                var result = 0;
                for (var maltIndex in malts) {
                    var malt = malts[maltIndex];
                    if (('mass' in malt) && ('yield_m' in malt)) {
                        result += producedSugarPerMalt(malt['mass'], malt['yield_m'], globalEfficiency);
                    }
                }
                return result;
            }
        };


        /**
         * Convert Brix gravity to specific gravity
         * 
         * @param float brix gravity (for 10%, enter 10)
         * 
         * @return float
         **/
        /*var brixToSg = function(brix) {
           return 0.00000003742517 * Math.pow(brix,3) + 0.00001370735 * Math.pow(brix,2) + 0.003859118 * brix + 1.000898;
        };*/
        var brixToSg = function(brix) {
            return sg_to_brix.invert(brix);
        }
        

        /**
         * Convert specific gravity to brix gravity
         * 
         * @param float sg specific gravity
         * 
         * @return float
         **/
        /*var sgToBrix = function(sg) {
            return 182.4601 * Math.pow(sg, 3) - 775.6821 * Math.pow(sg, 2) + 1262.7794 * sg - 669.5622;
        };*/
        var sgToBrix = function(sg) {
            return sg_to_brix.direct(brix);
        }

        /**
         * Convert plato gravity to specific gravity
         * 
         * @param float plato gravity (for 10%, enter 10)
         * 
         * @return float
         **/
        /*var platoToSg = function(plato) {
            return 4.3074e-8 * Math.pow(plato,3) + 1.3488e-5 * Math.pow(plato,2) + 3.8661e-3 * plato + 1.00001;
        };*/
        var platoToSg = function(plato) {
            return sg_to_plato.invert(plato);
        }

        /**
         * Convert specific gravity to brix gravity
         * 
         * @param float sg specific gravity
         * 
         * @return float
         **/
        /*var sgToPlato = function(sg) {
            return 135.997 * Math.pow(sg, 3) - 630.272 * Math.pow(sg, 2) + 1111.14 * sg - 616.868;
        };*/
        var sgToPlato = function(plato) {
            return sg_to_plato.direct(plato);
        }

        /**
         * Convert specific gravity to alcohol rate
         * 
         * @param float sg specific gravity
         * 
         * @return float
         **/
        var sgToAlcohol = function(sg) {
            return alcohol / 0.0076;
        };


        /**
         * Convert alcohol to specific gravity
         * 
         * @param float alcohol rate (10 for 10%)
         * 
         * @return float
         **/
        var alcoholToSg = function(alcohol) {
            return 0.0076 * alcohol;
        };

        /**
         * Convert specific gravity to alcohol rate
         * 
         * @param float initialSg initial specific gravity
         * @param float finalSg   specific gravity after fermentation (default: attenuation 25%)
         * 
         * @return float
         **/
        var sgToAlcohol = function(initialSg, finalSg) {
            if ('undefined' === typeof finalSg) {
                finalSg = 1 + (initialSg - 1) / 4;
            }
            return (initialSg - finalSg) / 0.0076;
        };


        /**
         * Compute the densities as a result of the dilution of sugar un a volume of liquide
         * 
         * @param float volume       volume of the liquide in liter
         * @param float sugar        the amount of sugar in kilo
         * @param float residualRate residual sugar rate; ie. if 0.25, with initial gravity 1.080, 
         *                           the final gravity will be 1.020
         * 
         * @return object
         **/
        var diluateSugar = function(volume, sugar, residualRate) {
            if ('undefined' === typeof residualRate) {
                residualRate = 0.25;
            }
            var brix = (volume !==0) ? 100*sugar/volume : 0;
            var sg = brixToSg(brix);
            var finalSg = 1 + (sg - 1) * residualRate;
            var alcohol = sgToAlcohol(sg, finalSg);
            var plato= sgToPlato(sg);
            return {
                brixGravity: brix,
                specificGravity: sg,
                residualGravity: finalSg,
                platoGravity: plato,
                alcohol: alcohol
            };
        };
        
        return {
            densityCorrection: densityCorrection,
            gravityToAlcohol: gravityToAlcohol,
            gravityDilution: gravityDilution,
            mashingVolume: mashingVolume,
            grainRetention: grainRetention,
            volumeToBoil: volumeToBoil,
            producedSugar: producedSugar,
            brixToSg: brixToSg,
            sgToBrix: sgToBrix,
            platoToSg: platoToSg,
            sgToPlato: sgToPlato,
            alcoholToSg: alcoholToSg,
            sgToAlcohol: sgToAlcohol,
            diluateSugar: diluateSugar
        };
    }]);
    
})();
