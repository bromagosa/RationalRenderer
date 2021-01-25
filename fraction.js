window.renderText = function (aString, canvas, fontSize, offsetX, offsetY) {
    // Takes a pseudo-markdown string, possibly containing fractions, and
    // returns a canvas where the string has been parsed and rendered
    var ctx = canvas.getContext('2d'),
        y = offsetY || 0, x = offsetX || 0, width = 0,
        fontSize = fontSize || 32;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = fontSize + 'px Arial';
    ctx.fillStyle = 'black';

    aString.split('\n').forEach(line => {
        x = offsetX;
        if (line[0] === '~') {
            var fraction = parseFraction(line.slice(1));
            Fraction.fontSize = fontSize;
            fraction.drawOn(ctx, x, y);
            y += fraction.height();
            width = Math.max(width, fraction.width());
        } else {
            line.split('').forEach((character, i) => {
                switch (character) {
                    case '*':
                        if (ctx.font.includes('bold ')) {
                            ctx.font = ctx.font.replace('bold ', '');
                        } else {
                            ctx.font = 'bold ' + ctx.font;
                        }
                        break;
                    case '_':
                        if (ctx.font.includes('italic ')) {
                            ctx.font = ctx.font.replace('italic ', '');
                        } else {
                            ctx.font = 'italic ' + ctx.font;
                        }
                        break;
                    default:
                        ctx.fillText(character, x, y);
                        x += ctx.measureText(character).width;
                        width = Math.max(width, x);
                        break;
                }
            });
            y += fontSize;
        }
    });

    return [width - offsetX, y - offsetY];
};

window.parseFraction = function (aString) {
    // * All fractions need to be parenthesized
    // * All non-fractional parts of a numerator or denominator need to be
    //   enclosed by brackets and separated by commas
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

function Fraction (numerator, denominator) {
    this.init(numerator, denominator);
};

Fraction.prototype.init = function (numerator, denominator) {
    this.numerator = numerator;
    this.denominator = denominator;
    this.isFraction = true;
};

Fraction.debug = false;
Fraction.fontSize = 32;

Fraction.prototype.drawOn = function (context, x, y, totalWidth) {
    var x = x || 0,
        y = y || 0,
        fontSize = Fraction.fontSize,
        width = this.width(),
        totalWidth = totalWidth || width;

    if (Fraction.debug) {
        context.save();
        context.beginPath();
        context.strokeStyle =
            'rgb(' +
            Math.floor(Math.random() * 255) + ',' +
            Math.floor(Math.random() * 255) + ',' +
            Math.floor(Math.random() * 255) + ')';
        context.rect(x, y, width, this.height());
        context.stroke();
        context.restore();
    }

    context.save();
    this.numerator.drawOn(
        context,
        x +
            (this.numerator.isFraction ?
                (totalWidth - this.numerator.width()) / 2 :
                (width - this.numerator.width()) / 2
            ),
        y,
        totalWidth
    );
    context.restore();

    // line
    context.lineWidth = Math.max(fontSize / 12, 1);
    y += this.numerator.height() + context.lineWidth;
    context.save();
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + width, y);
    context.stroke();
    context.restore();
    y += context.lineWidth;

    this.denominator.drawOn(
        context,
        x +
            (this.denominator.isFraction ?
                (totalWidth - this.denominator.width()) / 2 :
                (width - this.denominator.width()) / 2
            ),
        y + context.lineWidth * 2,
        totalWidth
    );

};

Fraction.prototype.width = function () {
    var fontSize = Fraction.fontSize,
        width = Math.max(
            this.numerator.width(fontSize),
            this.denominator.width(fontSize)
        );

    if (this.numerator.isFraction || this.denominator.isFraction) {
        width += fontSize;
    }

    return width;
};

Fraction.prototype.height = function () {
    var fontSize = Fraction.fontSize,
        lineWidth = Math.max(fontSize / 12, 1);
    return this.numerator.height(fontSize) +
        this.denominator.height(fontSize) + lineWidth * 4;
};

// String methods

String.prototype.textMetrics = function () {
    var context = document.createElement('canvas').getContext('2d'),
        metrics;
    context.font = Fraction.fontSize + 'px monospace';
    context.fillText(this, 0, 0);
    return context.measureText(this);
};

String.prototype.width =  function () {
    return this.textMetrics().width;
};

String.prototype.height = function () {
    // The "proper way" is broken:
    /*
    var metrics = this.textMetrics(fontSize);
    return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    */
    return Fraction.fontSize;
};

String.prototype.drawOn = function (context, x, y, totalWidth) {
    context.save();
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.font = Fraction.fontSize + 'px monospace';
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

Number.prototype.width = function () {
    return this.toString().width();
};

Number.prototype.height = function () {
    return this.toString().height();
}

Number.prototype.drawOn = function (context, x, y, totalWidth) {
    this.toString().drawOn(context, x, y, totalWidth);
};

// Array methods

Array.prototype.width = function () {
    const reducer = (acc, each) => acc + each.width();
    return this.reduce(reducer, 0);
};

Array.prototype.height = function () {
    const reducer = (acc, each) => Math.max(acc, each.height());
    return this.reduce(reducer, 0);
};

Array.prototype.drawOn = function (context, x, y, totalWidth) {
    var x = x,
        y = y,
        height = this.height();

    this.forEach(
        each => {
            each.drawOn(
                context,
                x,
                y + (height - each.height()) / 2,
                totalWidth
            );
            x += each.width();
        }
    );
};

window.Fraction = Fraction;
