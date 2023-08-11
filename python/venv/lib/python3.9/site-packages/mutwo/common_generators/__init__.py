from . import constants

from .brown import *
from .brun import *
from .chomksy import *
from .edwards import *
from .gray import *
from .koenig import *
from .lehmer import *
from .toussaint import *

from mutwo import core_utilities

__all__ = core_utilities.get_all(
    brown, brun, chomksy, edwards, gray, koenig, lehmer, toussaint
)

# Force flat structure
del brown, brun, core_utilities, chomksy, edwards, gray, koenig, lehmer, toussaint
