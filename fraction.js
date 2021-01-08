var debug = true;

function Fraction (numerator, denominator) {
    this.init(numerator, denominator);
};

Fraction.prototype.init = function (numerator, denominator, fontSize) {
    this.numerator = numerator;
    this.denominator = denominator;
    this.fontSize = fontSize || 32;
    this.isFraction = true;
};

Fraction.prototype.drawOn = function (context, fontSize, x, y) {
    var x = x || 0,
        y = y || 0,
        fontSize = fontSize || this.fontSize
        width = this.width(fontSize);

    this.numerator.drawOn(
        context,
        fontSize,
        x + (width - this.numerator.width(fontSize)) / 2,
        y
    );

    // line
    context.lineWidth = Math.max(fontSize / 12, 1);
    y += this.numerator.height(fontSize) + context.lineWidth * 2;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + width, y);
    context.stroke();
    y += context.lineWidth * 2;

    this.denominator.drawOn(
        context,
        fontSize,
        x + (width - this.denominator.width(fontSize)) / 2,
        y
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

String.prototype.drawOn = function (context, fontSize, x, y) {
    context.textAlign = 'left';
    context.textBaseline = 'top'; 
    context.font = fontSize + 'px monospace';
    context.fillStyle = 'black';
    if (debug) {
        context.beginPath();
        context.fillStyle =
            'rgba(' +
            Math.floor(Math.random() * 255) + ',' +
            Math.floor(Math.random() * 255) + ',' +
            Math.floor(Math.random() * 255) + ',' +
            '0.5)';
        context.rect(x,y,this.width(fontSize), this.height(fontSize));
        context.fill();
        context.fillStyle = context.fillStyle.replace('0.5)', '1)');
    }
    context.fillText(this, x, y);
};

// Number methods

Number.prototype.width = function (fontSize) {
    return this.toString().width(fontSize);
};

Number.prototype.height = function (fontSize) {
    return this.toString().height(fontSize);
}

Number.prototype.drawOn = function (context, fontSize, x, y) {
    this.toString().drawOn(context, fontSize, x, y);
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

Array.prototype.drawOn = function (context, fontSize, x, y) {
    var x = x,
        y = y,
        height = this.height(fontSize);

    this.forEach(
        each => {
            each.drawOn(
                context,
                fontSize,
                x,
                y + (height - each.height(fontSize)) / 2);
            x += each.width(fontSize);
        }
    );
};
