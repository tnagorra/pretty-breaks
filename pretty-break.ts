const DBL_EPSILON = 2.2204460492503131e-16;
const DBL_MIN = 2.2250738585072013830902327173324040642192159804623318306e-308;
const DBL_MAX = 1.7976931348623157E+308;

// CHECK for divisions

function prettyBreaks(
    l: number,
    u: number,
    n: number = 5,
    minN: number = Math.floor(n / 3),
    shrinkSml: number = 0.75,
    highUFact: [number, number] = [1.5, 0.5 + 1.5 * 1.5],
    epsCorrection: number = 0,
    returnBounds: boolean = true,
) {
    let lo = l;
    let up = u;
    let ndiv = n;

    const roundingEps = 1e-10;
    const [h, h5] = highUFact;

    let cell: number;
    let unit: number;
    let U: number;
    let ns: number;
    let nu: number;
    let k: number;
    let iSmall: boolean;

    const dx = up - lo;

    if (dx === 0 && up === 0) {
        cell = 1;
        iSmall = true;
    } else {
        cell = Math.max(Math.abs(lo), Math.abs(up));
        U = 1 + ((h5 >= 1.5 * h + 0.5) ? 1 / (1 + h) : 1.5 / (1 + h5));
        U *= Math.max(1, ndiv) * DBL_EPSILON;
        iSmall = dx < cell * U * 3;
    }

    if (iSmall) {
        if (cell > 10) {
            cell = 9 + cell / 10;
        }
        cell *= shrinkSml;
        if (minN > 1) {
            cell /= minN;
        }
    } else {
        cell = dx;
        if (ndiv > 1) {
            cell /= ndiv;
        }
    }

    if (cell < 20 * DBL_MIN) {
        console.warn('very small range.. corrected');
        cell = 20 * DBL_MIN;
    } else if (cell * 10 > DBL_MAX) {
        console.warn('very large range.. corrected');
        cell = 0.1 * DBL_MAX;
    }

    const base = Math.pow(10.0, Math.floor(Math.log10(cell))); /* base <= cell < 10*base */

    unit = base;
    U = 2 * base;
    if (U - cell < h * (cell - unit)) {
        unit = U;
        U = 5 * base;
        if (U - cell < h5 * (cell - unit)) {
            unit = U;
            U = 10 * base;
            if (U - cell < h * (cell - unit)) {
                unit = U;
            }
        }
    }

    ns = Math.floor(lo / unit + roundingEps);
    nu = Math.ceil(up / unit - roundingEps);

    if (epsCorrection && (epsCorrection > 1 || !iSmall)) {
        if (lo !== 0.0) {
            lo *= (1 - DBL_EPSILON);
        } else {
            lo = -DBL_MIN;
        }
        if (up !== 0.0) {
            up *= (1 + DBL_EPSILON);
        } else {
            up = +DBL_MIN;
        }
    }

    while (ns * unit > lo + roundingEps * unit) {
        ns -= 1;
    }

    while (nu * unit < up - roundingEps * unit) {
        nu += 1;
    }

    k = Math.floor(0.5 + nu - ns);
    if (k < minN) {
        k = minN - k;
        if (ns >= 0.0) {
            nu += Math.floor(k / 2);
            ns -= Math.floor(k / 2) + (k % 2);
        } else {
            ns -= Math.floor(k / 2);
            nu += Math.floor(k / 2) + (k % 2);
        }
        ndiv = minN;
    } else {
        ndiv = k;
    }

    if (returnBounds) {
        if (ns * unit < lo) {
            lo = ns * unit;
        }
        if (nu * unit > up) {
            up = nu * unit;
        }
    } else {
        lo = ns;
        up = nu;
    }

    return {
        unit,
        lo,
        up,
        ndiv,
    };
}

console.log(prettyBreaks(-0.134, 0.689082));
console.log(prettyBreaks(10.1, 45.2));
