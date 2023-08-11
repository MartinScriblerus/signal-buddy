from mutwo import core_events

__all__ = (
    "InvalidMinimaCurveAndMaximaCurveCombination",
    "UnequalEnvelopeDurationError",
    "InvalidStartAtValueError",
    "NoSolutionFoundError",
)


class InvalidMinimaCurveAndMaximaCurveCombination(Exception):
    """Raise for invalid envelope combinations in :class:`mutwo.common_generators.Tendency`."""


class UnequalEnvelopeDurationError(InvalidMinimaCurveAndMaximaCurveCombination):
    def __init__(
        self, minima_curve: core_events.Envelope, maxima_curve: core_events.Envelope
    ):
        super().__init__(
            "Found unequal duration when comparing 'minima_curve' "
            f"(with duration = '{minima_curve.duration}')"
            f"  and 'maxima_curve' (with duration = "
            f"'{maxima_curve.duration}'). Make sure both curves "
            "have equal duration."
        )


class InvalidStartAtValueError(ValueError):
    """Raise for invalid error of 'start_at' in :class:`mutwo.common_generators.ActivityLevel`"""

    def __init__(self, start_at: int):
        super().__init__(
            "The value for the parameter 'start_at' has to be"
            f"assigned to either 0, 1 or 2 and not {start_at}, "
            "because there are only three different tuples defined per level."
        )


class InvalidActivityLevelError(ValueError):
    """Raise for invalid 'level' when calling :class:`mutwo.common_generators.ActivityLevel`"""

    def __init__(self, level: int, allowed_range_tuple: tuple[int, ...]):
        super().__init__(
            f"The parameter 'level' is assigned to {level} "
            f"but has to be in the range of {allowed_range_tuple}."
        )


class NoSolutionFoundError(Exception):
    """Raise in case backtracking algorithm can't find any solution"""

    def __init__(self):
        super().__init__("No solution could be found.")


class InvalidSizeError(ValueError):
    """Raise for invalid 'size' parameter value in :func:`mutwo.common_generators.paradiddle`"""

    def __init__(self, size: int):
        super().__init__(
            f"Invalid value '{size}' for argument 'size'. 'Size' has to "
            "be divisible by 2 and has to be bigger than 2."
        )
