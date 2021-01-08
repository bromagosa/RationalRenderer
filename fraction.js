function parseFraction (aString) {
    // * All fractions need to be parenthesized
    // * All non-fractional parts of a numerator or denominator need to be enclosed by brackets
    //   and separated by commas
    // Ex: ([(2/3),+,([4,*,45]/123)]/15)
    return eval(
        aString.replace(
            /\(/gi,
            (match) => 'new Fraction' + match + ''
        ).replaceAll(
            '\/',
            ','
        ).replace(
            /[\+\-\*·]+/gi,
            (match) => "'" + match + "'"
        ).replaceAll(
            '*',
            '×'
        )
    );
};

function Fraction (numerator, denominator, fontSize) {
    this.init(numerator, denominator);
};

Fraction.prototype.init = function (numerator, denominator, fontSize) {
    this.numerator = numerator;
    this.denominator = denominator;
    this.fontSize = fontSize || 32;
    this.isFraction = true;
};

Fraction.debug = false;

Fraction.prototype.drawOn = function (context, fontSize, x, y, totalWidth) {
    var x = x || 0,
        y = y || 0,
        fontSize = fontSize || this.fontSize,
        width = this.width(fontSize),
        totalWidth = totalWidth || width;

    if (Fraction.debug) {
        context.save();
        context.beginPath();
        context.strokeStyle =
            'rgb(' +
            Math.floor(Math.random() * 255) + ',' +
            Math.floor(Math.random() * 255) + ',' +
            Math.floor(Math.random() * 255) + ')';
        context.rect(x,y,width,this.height(fontSize));
        context.stroke();
        context.restore();
    }

    context.save();
    this.numerator.drawOn(
        context,
        fontSize,
        x +
            (this.numerator.isFraction ?
                (totalWidth - this.numerator.width(fontSize)) / 2 :
                (width - this.numerator.width(fontSize)) / 2
            ),
        y,
        totalWidth
    );
    context.restore();

    // line
    context.lineWidth = Math.max(fontSize / 12, 1);
    y += this.numerator.height(fontSize) + context.lineWidth;
    context.save();
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + width, y);
    context.stroke();
    context.restore();
    y += context.lineWidth;

    this.denominator.drawOn(
        context,
        fontSize,
        x +
            (this.denominator.isFraction ?
                (totalWidth - this.denominator.width(fontSize)) / 2 :
                (width - this.denominator.width(fontSize)) / 2
            ),
        y + context.lineWidth * 2,
        totalWidth
    );

};

Fraction.prototype.width = function (fontSize) {
    var width = Math.max(
        this.numerator.width(fontSize),
        this.denominator.width(fontSize)
    );

    if (this.numerator.isFraction || this.denominator.isFraction) {
        width += fontSize;
    }

    return width;
};

Fraction.prototype.height = function () {
    var lineWidth = Math.max(this.fontSize / 12, 1);
    return this.numerator.height(this.fontSize) +
        this.denominator.height(this.fontSize) + lineWidth * 4;
};

// String methods

String.prototype.textMetrics = function (fontSize) {
    var context = document.createElement('canvas').getContext('2d'),
        metrics;
    context.font = fontSize + 'px monospace';
    context.fillText(this, 0, 0);
    return context.measureText(this);
};

String.prototype.width =  function (fontSize) {
    return this.textMetrics(fontSize).width;
};

String.prototype.height = function (fontSize) {
    // The "proper way" is broken:
    /*
    var metrics = this.textMetrics(fontSize);
    return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    */
    return fontSize;
};

String.prototype.drawOn = function (context, fontSize, x, y, totalWidth) {
    context.save();
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.font = fontSize + 'px monospace';
    if (Fraction.debug) {
        context.fillStyle =
            'rgba(' +
            Math.floor(Math.random() * 255) + ',' +
            Math.floor(Math.random() * 255) + ',' +
            Math.floor(Math.random() * 255) + ',' +
            '1)';
    } else {
        context.fillStyle = 'black';
    }
    context.fillText(this, x, y);
    context.restore();
};

// Number methods

Number.prototype.width = function (fontSize) {
    return this.toString().width(fontSize);
};

Number.prototype.height = function (fontSize) {
    return this.toString().height(fontSize);
}

Number.prototype.drawOn = function (context, fontSize, x, y, totalWidth) {
    this.toString().drawOn(context, fontSize, x, y, totalWidth);
};

// Array methods

Array.prototype.width = function (fontSize) {
    const reducer = (acc, each) => acc + each.width(fontSize);
    return this.reduce(reducer, 0);
};

Array.prototype.height = function (fontSize) {
    const reducer = (acc, each) => Math.max(acc, each.height(fontSize));
    return this.reduce(reducer, 0);
};

Array.prototype.drawOn = function (context, fontSize, x, y, totalWidth) {
    var x = x,
        y = y,
        height = this.height(fontSize);

    this.forEach(
        each => {
            each.drawOn(
                context,
                fontSize,
                x,
                y + (height - each.height(fontSize)) / 2,
                totalWidth
            );
            x += each.width(fontSize);
        }
    );
};
