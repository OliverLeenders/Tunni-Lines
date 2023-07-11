# Tunni Lines Reverse Engineered

## Motivation

I have been amazed by the ingenuity and ease of use of FontLab's _Tunni Line_ feature. Using either
a single control point or dragging a line, the user is allowed to symmetrically and asymetrically
change the shape of a cubic bezier curve. While the start and endpoints stay the same and the
direction of the control handles remains fixed, the handles are linearly scaled in order to modify
the curve.

Using the visualizations on the FontLab website, I have reverse engineered the math behind the
feature and implemented a simple example using `D3.js` (probably overkill for such a simple thing
but hey).

_I do not in any way intend to infringe FontLab's copyright_; however, this is relatively simple
2D-geometry and in my opinion anyone with some time on their hands and some experience with the math
could recreate this just from the material publicly available on their website. Therefore, I suppose 
publishing this is okay.

## Math

### Position Given Control Points

Given a starting point $(a_x, a_y)$, control points $(c_x^{(1)}, c_y^{(1)}),
(c_x^{(2)}, c_y^{(2)})$ and an endpoint $(b_x, b_y)$, as well as the intersection point of the 
control handles $(s_x, s_y)$ the position of the Tunni Control point $(t_x, t_y)$ is defined as 
follows:

$$t_x = 2 \cdot c_x^{(1)} - a_x + 2 * c_x^{(2)} - b_x - s_x$$
$$t_y = 2 \cdot c_y^{(1)} - a_y + 2 * c_y^{(2)} - b_y - s_y$$

The Tunni Line however is simply a line between the points $c^{(1)}$ and $c^{(2)}$.

### Position of the Handles Given Tunni Point and Handle Direction



