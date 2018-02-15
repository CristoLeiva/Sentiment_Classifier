
module.exports = function (objTokens) {
    var countAdjs = 0;
    var countNouns = 0;
    var countAdvrs = 0;
    var countVerbs = 0;

    var taggedTokens = objTokens.fullTokens;

    for (var i =0; i < taggedTokens.length; i++) {
        var tag = taggedTokens.tag;
        if (tag == 'N' || tag == '^' || tag == 'S' || tag == 'Z' || tag == 'M') {
            countNouns++;
        }else
        if (tag == 'R') {
            countAdvrs++;
        }else
        if (tag == 'V') {
            countVerbs++;
        }else
        if (tag == 'A') {
            countAdjs++;
        }
    }

    var final = {
        countAdjectives: countAdjs,
        countNouns: countNouns,
        countAdverbs: countAdvrs,
        countVerbs: countVerbs,
        taggedTokens: taggedTokens
    }
    return final;
}