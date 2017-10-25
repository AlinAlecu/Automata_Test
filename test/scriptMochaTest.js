const assert = chai.assert;

// test adding 3 cubes
describe("adding 3 cubes", function () {
    it("should add 3 cubes, with random colours and positions", function () {
        assert.equal(add_cube(), "added");
        assert.equal(add_cube(), "added");
        assert.equal(add_cube(), "added");
    });
});

// test camera reset
describe("resetting camera", function () {
    it("position should be 0,0,5", function () {
        assert.equal(original_camera(), "0,0,5");
    });
});

// test scaling up
describe("scaling up", function () {
    it("scaling up by 0.1 -> 1.1", function () {
        var value = Math.round(scale_up() * 10) / 10;
        assert.equal(value, 1.1);
    });
    it("scaling up by 0.1 -> 1.2", function () {
        var value = Math.round(scale_up() * 10) / 10;
        assert.equal(value, 1.2);
    });
    it("scaling up by 0.1 -> 1.3", function () {
        var value = Math.round(scale_up() * 10) / 10;
        assert.equal(value, 1.3);
    });
});

// test scaling down
describe("scaling down", function () {
    it("scaling down by 0.1 - > 1.2", function () {
        var value = Math.round(scale_down() * 10) / 10;
        assert.equal(value, 1.2);
    });
    it("scaling down by 0.1 -> 1.1", function () {
        var value = Math.round(scale_down() * 10) / 10;
        assert.equal(value, 1.1);
    });
});

// test default sizes
describe("default sizes", function () {
    it("size should be 1", function () {
        assert.equal(default_size(), 1);
    });
});
