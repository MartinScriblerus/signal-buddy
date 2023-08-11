"""Algorithms which are related to US mathematician D.H. Lehmer."""

import abc
import typing

from mutwo import common_utilities

__all__ = ("Backtracking", "IndexBasedBacktracking")

Solution = tuple[typing.Any, ...]
ElementList = list[typing.Any]


class Backtracking(abc.ABC):
    """Abstract base class to implement a backtracking algorithm

    By inheriting from this class, various backtracking algorithms
    can be implemented. In order to do so the user has to override
    a set of abstract methods. The abstract methods include:

        - :abstractmethod:`Backtracking.is_valid`
        - :abstractmethod:`Backtracking.solution_count`
        - :abstractmethod:`Backtracking.append_new_element`
        - :abstractmethod:`Backtracking.update_last_element`
        - :abstractmethod:`Backtracking.can_last_element_be_updated`

    Furthermore it may be helpful to override the following method
    (even though there is a valid working implementation):

        - :method:`Backtracking.element_list_to_solution`

    Please see the methods documentation for more details.

    The implementation of this backtracking algorithm makes a distinction
    between an element list and a solution. A solution is created by an
    element list. A solution is the output a user wants to get, but
    an element list is an object which is used internally in order to
    solve the problem. When implementing a backtracking algorithm by
    using this interface the user doesn't have to make the distinction
    between both (and in this case treat both in the same way).

    The most common use case for this distinction is by having a set of
    items which can appear in the solution and a list of indices which
    item of set shall be used. In this  case the element_list is actually
    a list of indices. This use case is implemented in the
    :class:`IndexBasedBacktracking` class.

    `Bitner and Reingold [2] credit Derrick H. Lehmer with first using the
    term 'backtrack' in the 1950s.
    <https://www.chessprogramming.org/Backtracking>`_.
    """

    @property
    @abc.abstractmethod
    def solution_count(self) -> int:
        """Return expected solution size"""

    @abc.abstractmethod
    def is_valid(self, element_list: ElementList) -> bool:
        """Checks if an element list provides an acceptable solution.

        :return: `True` if the solution is acceptable and `False` if
            the solution is rejected.
        """

    @abc.abstractmethod
    def append_new_element(self, element_list: ElementList):
        """Append new element to element list.

        :param element_list: The element list to which a new
            element shall be appended.
        """

    @abc.abstractmethod
    def update_last_element(self, element_list: ElementList):
        """Increments value of the last element in an element_list.

        :param element_list: The element list which last value shall
            be updated.

        This function should raise an Exception in case the last
        element can't be updated.
        """

    @abc.abstractmethod
    def can_last_element_be_updated(self, element_list: ElementList) -> bool:
        """Checks if the last element of the list can be incremented.

        :param element_list: The element list which last value shall
            be checked.
        """

    def element_list_to_solution(self, element_list: ElementList) -> Solution:
        """Converts an element list to the final solution

        :param element_list: The element list to be converted.
        """
        return tuple(element_list)

    def solve(
        self, return_element_list: bool = False
    ) -> typing.Union[Solution, tuple[Solution, ElementList]]:
        """Apply backtracking algorithm.

        :param return_element_list: If set to `True` the function
            will not only return the solution, but also the element
            list.
        """

        element_list = []
        while True:
            if self.is_valid(element_list):
                if len(element_list) < self.solution_count:
                    self.append_new_element(element_list)
                else:
                    break
            else:
                while not self.can_last_element_be_updated(element_list):
                    element_list = element_list[:-1]
                    if len(element_list) == 0:
                        raise common_utilities.NoSolutionFoundError()

                self.update_last_element(element_list)

        solution = self.element_list_to_solution(element_list)
        if return_element_list:
            return solution, element_list
        return solution


class IndexBasedBacktracking(Backtracking):
    """Abstract base class for index based backtracking algorithms

    This class implements concrete solutions for the following methods
    which are inherited from the parent class :class:`Backtracking`:

        - :abstractmethod:`Backtracking.append_new_element`
        - :abstractmethod:`Backtracking.update_last_element`
        - :abstractmethod:`Backtracking.can_last_element_be_updated`

    The following methods still have to be implemented:

        - :abstractmethod:`Backtracking.is_valid`
        - :abstractmethod:`Backtracking.solution_count`

    (Please consult for more information the documentation
    of :class:`Backtracking`).

    Furthermore the class adds new abstract methods to be implemented
    by child classes:

        - :abstractmethod:`IndexBasedBacktracking.element_index_to_item_sequence`

    **Example:**

    >>> import itertools
    >>> from mutwo import common_generators
    >>> class QueenProblem8(common_generators.IndexBasedBacktracking):
            point_list = list(itertools.combinations_with_replacement(range(queen_count), 2))
            point_list.extend(
                [tuple(reversed(point)) for point in point_list if len(set(point)) == 2]
            )
            def element_index_to_item_sequence(self, element_index, element_list):
                return self.point_list
            @property
            def solution_count(self):
                # 8 queens problem!
                return 8
            def is_valid(self, element_list):
                solution = self.element_list_to_solution(element_list)
                for queen0, queen1 in itertools.combinations(solution, 2):
                    # x != x, y != y
                    is_valid = all(value0 != value1 for value0, value1 in zip(queen0, queen1))
                    difference_x, difference_y = (value0 - value1 for value0, value1 in zip(queen0, queen1))
                    is_valid = is_valid and (difference_x != difference_y)
                    if not is_valid: return False
                return True
    >>> queen_problem_8 = QueenProblem8()
    >>> queen_problem_8.solve()
    """

    @abc.abstractmethod
    def element_index_to_item_sequence(
        self, element_index: int, element_list: ElementList
    ) -> typing.Sequence[typing.Any]:
        """Get a sequence of items to choose from for a specific element

        :param element_index: The index of the element for which a sequence
            of solutions shall be returned.
        :param element_list: The current element list
        """

    def append_new_element(self, element_list: ElementList):
        element_list.append(0)

    def update_last_element(self, element_list: ElementList):
        element_list[-1] += 1

    def can_last_element_be_updated(self, element_list: ElementList) -> bool:
        max_index = len(
            self.element_index_to_item_sequence(len(element_list) - 1, element_list)
        )
        return element_list[-1] + 1 < max_index

    def element_list_to_solution(self, element_list: ElementList) -> Solution:
        return tuple(
            self.element_index_to_item_sequence(element_index, element_list)[element]
            for element_index, element in enumerate(element_list)
        )
