var test_cases = {
empty: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     64 64
BACK    0    0    0
AMBIENT 0.75 0.75 0.75
`,

testOutline: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     64 64
SPHERE  0  0 -10   3 3 1   0.5 0 0   1 0 0 50 0 0 0.8
SPHERE  5  5 -10   3 3 1   0.5 0 0   1 0 0 50 0 0 0.8
SPHERE  5 -5 -10   3 3 1   0.5 0 0   1 0 0 50 0 0 0.8
SPHERE -5  5 -10   3 3 1   0.5 0 0   1 0 0 50 0 0 0.8
SPHERE -5 -5 -10   3 3 1   0.5 0 0   1 0 0 50 0 0 0.8
LIGHT 0 0 0   0.3 0.3 0.3
BACK    0   0   1
AMBIENT 0.5 0.5 0.5
`,

testFacingWrong: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     64 64
SPHERE  0 0 10 2 4 2 0.5 0 0 1 0 0 50 0 0 0.8
SPHERE  4 4 10 1 2 1 0 0.5 0 1 0 0 50 0 0 0.8
SPHERE -4 2 10 1 2 1 0 0 0.5 1 0 0 50 0 0 0.8
LIGHT  0  0   0    0.3 0.3 0.3
LIGHT  10 10 -10   0.9 0.9 0
LIGHT -10 5  -5    0   0   0.9
BACK    0.4  0.2  0.1
AMBIENT 0.75 0.75 0.75
`,

testAmbient: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     64 64
SPHERE  0 0 -10   2 4 2   0.5 0   0     1 0 0 50 0 0 0.8
SPHERE  4 4 -10   1 2 1   0   0.5 0     1 0 0 50 0 0 0.8
SPHERE -4 2 -10   1 2 1   0   0   0.5   1 0 0 50 0 0 0.8
LIGHT  0  0   0    0.3 0.3 0.3
LIGHT  10 10 -10   0.9 0.9 0
LIGHT -10 5  -5    0   0   0.9
BACK    0.5  0.5  0.5
AMBIENT 0.75 0.75 0.75
`,

testOverlap: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  4 1 -10   2 2 1   0.5 0   0     1 0 0 50 0 0 0.8
SPHERE  0 0 -10   4 4 1   0   0.5 0     1 0 0 50 0 0 0.8
SPHERE -4 1 -10   2 2 1   0.5 0   0.5   1 0 0 50 0 0 0.8
SPHERE  0 4 -10   3 3 1   0   0   0.5   1 0 0 50 0 0 0.8
LIGHT  0  -5  0    0.9 0   0
LIGHT  10  5  0    0   0.9 0
BACK    1    1    1
AMBIENT 0.85 0.85 0.85
`,

testDiffuse: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  0 0 -10   2 2 1   0.5 0   0     0 1 0 50 0 0 0.8
SPHERE  4 4 -10   2 2 1   0   0.5 0     0 1 0 50 0 0 0.8
SPHERE -4 2 -10   2 2 1   0   0   0.5   0 1 0 50 0 0 0.8
LIGHT  0  -5  0    0.9 0   0
LIGHT  10  5  0    0   0.9 0
LIGHT -10  5  0    0   0   0.9
BACK    0.5  0.5  0.5
AMBIENT 0.75 0.75 0.75
`,

testSpecular: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  4 4 -10   2 2 1   0.5 0   0     0 0 1 100  0 0 0.8
SPHERE  0 0 -10   2 2 1   0   0.5 0     0 0 1 10   0 0 0.8
SPHERE -4 2 -10   2 2 1   0   0   0.5   0 0 1 1000 0 0 0.8
LIGHT  0  -5  0    0.9 0   0
LIGHT  10  5  0    0   0.9 0
LIGHT -10  5  0    0   0   0.9
BACK    1    1    1
AMBIENT 0.75 0.75 0.75
`,

testOblong: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  4 4  -10   10 2  2   0.5 0   0     0 1 1 100  0 0 0.8
SPHERE -4 0  -6    2  10 2   0   0.5 0     0 1 1 10   0 0 0.8
SPHERE  4 0  -12   2  10 2   1   1   0     0 1 1 10   0 0 0.8
SPHERE  0 -4 -8    5  2  1   0   0   0.5   0 1 1 1000 0 0 0.8
LIGHT  0  -5  0    0.9 0   0
LIGHT  10  5  0    0   0.9 0
LIGHT -10  5  0    0   0   0.9
BACK    1    1    1
AMBIENT 0.75 0.75 0.75
`,
testInteriorLight: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES 64 64
SPHERE 0 0   -1.5    2   2   2     0.8 0.5 0.5   0.5 1 0.9 50 0.5 0.5 0.7
LIGHT  0 1.5 -1.5    0.9 0.9 0.9
`,

testTrappedLight: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  0 0 -10   2    4    2     0.5 0   0     1 1 0.9 50 0 0 0.8
SPHERE  4 4 -10   1    2    1     0   0.5 0     1 1 0.9 50 0 0 0.8
SPHERE -4 2 -10   1    2    1     0   0   0.5   1 1 0.9 50 0 0 0.8
SPHERE  1 1 -1    0.25 0.25 0.5   0   0   0.5   1 1 1   50 0 0 0.8
LIGHT  1  1  -1    0.9 0.9 0.9
LIGHT  10 10 -10   0.3 0.3 0
LIGHT -10 5  -5    0   0   0.3
BACK    1   1   1
AMBIENT 0.2 0.2 0.2
`,

testShadow: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     128 128
SPHERE  3  3 -8    1 1 1   0.5 0   0     0 1 0.9 50 0 0 0.8
SPHERE  0  0 -10   2 2 1   0   0.5 0     0 1 0.9 50 0 0 0.8
SPHERE -4 -4 -12   2 2 1   0   0   0.5   0 1 0.9 50 0 0 0.8
LIGHT 0 0  0    0.7 0.7 0.7
LIGHT 5 5 -5    1   1   1
BACK    1    1    1
AMBIENT 0.75 0.75 0.75
`,

testReflectionFast: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     64 64
SPHERE  0 0 -10   2 4 2   0.5 0   0     0.5 1 0.9 50 1 0 0.8
SPHERE  4 4 -10   1 2 1   0   0.5 0     0.5 1 0.9 50 1 0 0.8
SPHERE -4 2 -10   1 2 1   0   0   0.5   0.5 1 0.9 50 1 0 0.8
LIGHT  0  0   0    0.9 0.9 0.9
LIGHT  10 10 -10   0.9 0.9 0
LIGHT -10 5  -5    0   0   0.9
BACK    0.1 0.2 0.4
AMBIENT 0.5 0.5 0.5
`,

testReflection: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     256 256
SPHERE  0 0 -10   2 4 2   0.5 0   0     0.5 1 0.9 50 1 0 0.8
SPHERE  4 4 -10   1 2 1   0   0.5 0     0.5 1 0.9 50 1 0 0.8
SPHERE -4 2 -10   1 2 1   0   0   0.5   0.5 1 0.9 50 1 0 0.8
LIGHT  0  0   0    0.9 0.9 0.9
LIGHT  10 10 -10   0.9 0.9 0
LIGHT -10 5  -5    0   0   0.9
BACK    0.1 0.2 0.4
AMBIENT 0.5 0.5 0.5
`,

testReflectionAndShadow: `
NEAR    0.75
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     256 256
SPHERE  2  0 -5   3   4 2     1 0   0     0.5 1 0.9 50 0.7 0 0.8
SPHERE -2  2 -5   1.5 3 1.5   0 0   0.5   0.5 1 0.9 50 0.7 0 0.8
SPHERE -2 -4 -5   1.5 3 1.5   1 0.5 0     0.5 1 0.9 50 0.7 0 0.8
LIGHT  30  90 -5   1 1 0
LIGHT -20 -10 -5   1 1 1
BACK    0.1 0.1 0.1
AMBIENT 0.5 0.5 0.5
`,

skySphere: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -2
TOP     2
RES     256 256
SPHERE  0 0 -10   2  4 2    0.7 0   0.3   0.2 1 0.9 50 0.75 0 0.8
SPHERE  0 4 -5    14 8 14   0.3 0   0     0.2 1 0.9 50 0.75 0 0.8
SPHERE -4 2 -10   1  2 1    0   0   0.7   0.2 1 0.9 50 0.75 0 0.8
SPHERE  2 2 -5    1  2 2    0   0.7 0.7   0.2 1 0.9 50 0.75 0 0.8
LIGHT  0   1.5  0     0.9 0.9 0.9
LIGHT  3.5 4.2 -5     0.9 0.9 0
LIGHT -5   2.5 -2.5   0   0   0.9
`,

testRefract: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     256 256
SPHERE 1  0 -8    2 4 2   0.5 0   0     0.5 1 0.9 50 0 1 0.8
SPHERE 1 -2 -4    1 2 1   0   0.5 0     0.5 1 0.9 50 0 1 0.8
SPHERE 1  2 -12   1 2 1   0   0   0.5   0.5 1 0.9 50 0 1 0.8
LIGHT  0  0   0    0.9 0.9 0.9
LIGHT  10 10 -10   0.9 0.9 0
LIGHT -10 5  -5    0   0   0.9
BACK    0.1 0.2 0.4
AMBIENT 0.5 0.5 0.5
`,

testTransparent: `
NEAR    1
LEFT   -1
RIGHT   1
BOTTOM -1
TOP     1
RES     256 256
SPHERE  0  1 -4   1 1 1   0.5 0   0     0 1 1 500  0.3 1 0.8
SPHERE  0  1 -6   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  0 -1 -4   1 1 1   0   0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  0 -1 -6   1 1 1   0   0   0.5   0 1 1 500  0.3 1 0.8
SPHERE -2  1 -4   1 1 1   0.5 0   0     0 1 1 500  0.3 1 0.8
SPHERE -2  1 -6   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE -2 -1 -4   1 1 1   0   0.5 0     0 1 1 500  0.3 1 0.8
SPHERE -2 -1 -6   1 1 1   0   0   0.5   0 1 1 500  0.3 1 0.8
SPHERE  2  1 -4   1 1 1   0.5 0   0     0 1 1 500  0.3 1 0.8
SPHERE  2  1 -2   1 1 1   0.5 0   0     0 1 1 500  0.3 1 0.8
SPHERE  2 -1 -2   1 1 1   0   0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  2 -1 -4   1 1 1   0   0   0.5   0 1 1 500  0.3 1 0.8
SPHERE  0  1 -2   1 1 1   0.5 0   0     0 1 1 500  0.3 1 0.8
SPHERE -2  1 -2   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE -2 -1 -2   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  2  1 -6   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  2 -1 -6   1 1 1   0.5 0.5 0     0 1 1 500  0.3 1 0.8
SPHERE  0 -1 -2   1 1 1   0   0.5 0     0 1 1 500  0.3 1 0.8
LIGHT  5 2 6   1   1 1
LIGHT  6 4 2   1 0.4 1
BACK    0.4 0.3 0.1
AMBIENT 0.2 0.2 0.2
`
};

var load_case = function( i ) {   document.getElementById( "input_scene" ).value = test_cases[ i ];   }